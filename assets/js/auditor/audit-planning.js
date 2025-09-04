// Audit Planning System
class AuditPlanner {
    constructor() {
        this.currentUser = null;
        this.auditPlans = [];
        this.templates = [];
        this.currentPlan = null;
        this.filteredPlans = [];
        
        // Initialize Firebase
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadAuditPlans = this.loadAuditPlans.bind(this);
        this.renderPlans = this.renderPlans.bind(this);
        this.openPlanningModal = this.openPlanningModal.bind(this);
        this.closePlanningModal = this.closePlanningModal.bind(this);
        this.savePlan = this.savePlan.bind(this);
        this.saveAsDraft = this.saveAsDraft.bind(this);
        this.updateScope = this.updateScope.bind(this);
        this.updateModalScope = this.updateModalScope.bind(this);
        this.updateAuditScope = this.updateAuditScope.bind(this);
        this.filterPlans = this.filterPlans.bind(this);
        this.exportPlans = this.exportPlans.bind(this);
        this.openTemplateModal = this.openTemplateModal.bind(this);
        this.closeTemplateModal = this.closeTemplateModal.bind(this);
        this.openDetailsModal = this.openDetailsModal.bind(this);
        this.closeDetailsModal = this.closeDetailsModal.bind(this);
        this.editPlan = this.editPlan.bind(this);
        this.duplicatePlan = this.duplicatePlan.bind(this);
        this.startAudit = this.startAudit.bind(this);
        this.calculateDuration = this.calculateDuration.bind(this);
    }

    async init() {
        try {
            // Check authentication
            this.currentUser = this.auth.currentUser;
            if (!this.currentUser) {
                console.error('User not authenticated');
                return;
            }

            // Initialize Lucide icons
            if (window.lucide) {
                lucide.createIcons();
            }

            // Load data
            await this.loadAuditPlans();
            await this.loadTemplates();
            await this.loadAuditors();

            // Set up event listeners
            this.setupEventListeners();

            // Initial render
            this.renderPlans();
            this.updateStats();

            console.log('Audit Planner initialized successfully');
        } catch (error) {
            console.error('Error initializing Audit Planner:', error);
        }
    }

    setupEventListeners() {
        // Date change listeners for duration calculation
        const startDateInput = document.getElementById('modalStartDate');
        const endDateInput = document.getElementById('modalEndDate');
        
        if (startDateInput && endDateInput) {
            startDateInput.addEventListener('change', this.calculateDuration);
            endDateInput.addEventListener('change', this.calculateDuration);
        }

        // Quick form listeners
        const startDate = document.getElementById('startDate');
        const duration = document.getElementById('duration');
        
        if (startDate && duration) {
            startDate.addEventListener('change', () => {
                if (startDate.value && duration.value) {
                    const endDate = new Date(startDate.value);
                    endDate.setDate(endDate.getDate() + parseInt(duration.value) - 1);
                    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
                }
            });
        }
    }

    async loadAuditPlans() {
        try {
            const snapshot = await this.db.collection('auditPlans')
                .where('factoryId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .get();

            this.auditPlans = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.filteredPlans = [...this.auditPlans];
        } catch (error) {
            console.error('Error loading audit plans:', error);
        }
    }

    async loadTemplates() {
        try {
            const snapshot = await this.db.collection('auditTemplates')
                .where('factoryId', '==', this.currentUser.uid)
                .get();

            this.templates = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }

    async loadAuditors() {
        try {
            const snapshot = await this.db.collection('users')
                .where('factoryId', '==', this.currentUser.uid)
                .where('role', 'in', ['auditor', 'lead_auditor'])
                .get();

            const auditors = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Populate lead auditor dropdown
            const leadAuditorSelect = document.getElementById('leadAuditor');
            if (leadAuditorSelect) {
                leadAuditorSelect.innerHTML = '<option value="">Select Lead Auditor</option>';
                auditors.forEach(auditor => {
                    const option = document.createElement('option');
                    option.value = auditor.id;
                    option.textContent = auditor.name;
                    leadAuditorSelect.appendChild(option);
                });
            }

            // Populate team members dropdown
            const teamMembersSelect = document.getElementById('teamMembers');
            if (teamMembersSelect) {
                teamMembersSelect.innerHTML = '<option value="">Select Team Members</option>';
                auditors.forEach(auditor => {
                    const option = document.createElement('option');
                    option.value = auditor.id;
                    option.textContent = auditor.name;
                    teamMembersSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading auditors:', error);
        }
    }

    updateScope() {
        const standard = document.getElementById('auditStandard').value;
        const scopeSelect = document.getElementById('auditScope');
        
        scopeSelect.innerHTML = '<option value="">Select Scope</option>';
        
        if (standard) {
            const scopes = this.getScopesForStandard(standard);
            scopes.forEach(scope => {
                const option = document.createElement('option');
                option.value = scope.value;
                option.textContent = scope.label;
                scopeSelect.appendChild(option);
            });
        }
    }

    updateModalScope() {
        const standard = document.getElementById('modalAuditStandard').value;
        const scopeSelect = document.getElementById('modalAuditScope');
        
        scopeSelect.innerHTML = '<option value="">Select Scope</option>';
        
        if (standard) {
            const scopes = this.getScopesForStandard(standard);
            scopes.forEach(scope => {
                const option = document.createElement('option');
                option.value = scope.value;
                option.textContent = scope.label;
                scopeSelect.appendChild(option);
            });
        }
    }

    updateAuditScope() {
        const auditType = document.getElementById('auditType').value;
        const standard = document.getElementById('auditStandard').value;
        
        if (auditType && standard) {
            this.updateScope();
        }
    }

    getScopesForStandard(standard) {
        const scopes = {
            'iso_9001': [
                { value: 'full', label: 'Full System Audit' },
                { value: 'partial', label: 'Partial System Audit' },
                { value: 'process', label: 'Process Audit' },
                { value: 'product', label: 'Product Audit' }
            ],
            'iso_14001': [
                { value: 'full', label: 'Full Environmental System' },
                { value: 'partial', label: 'Partial Environmental System' },
                { value: 'compliance', label: 'Compliance Audit' },
                { value: 'performance', label: 'Performance Audit' }
            ],
            'ohsas_18001': [
                { value: 'full', label: 'Full OHS System' },
                { value: 'partial', label: 'Partial OHS System' },
                { value: 'compliance', label: 'Compliance Audit' },
                { value: 'risk', label: 'Risk Assessment' }
            ],
            'sa_8000': [
                { value: 'full', label: 'Full Social Accountability' },
                { value: 'partial', label: 'Partial Social Accountability' },
                { value: 'labor', label: 'Labor Rights Audit' },
                { value: 'working_conditions', label: 'Working Conditions Audit' }
            ],
            'custom': [
                { value: 'custom', label: 'Custom Scope' }
            ]
        };

        return scopes[standard] || [];
    }

    calculateDuration() {
        const startDate = document.getElementById('modalStartDate').value;
        const endDate = document.getElementById('modalEndDate').value;
        const durationInput = document.getElementById('modalDuration');

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            durationInput.value = diffDays;
        }
    }

    openPlanningModal() {
        const modal = document.getElementById('auditPlanningModal');
        if (modal) {
            modal.style.display = 'flex';
            this.resetForm();
        }
    }

    closePlanningModal() {
        const modal = document.getElementById('auditPlanningModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    resetForm() {
        const form = document.getElementById('auditPlanForm');
        if (form) {
            form.reset();
            
            // Set default values
            document.getElementById('auditPriority').value = 'medium';
            document.getElementById('riskLevel').value = 'medium';
            document.getElementById('startTime').value = '09:00';
            document.getElementById('endTime').value = '17:00';
            document.getElementById('timeZone').value = 'UTC+7';
            
            // Clear duration
            document.getElementById('modalDuration').value = '';
        }
    }

    async savePlan() {
        try {
            this.showLoading();

            const formData = this.getFormData();
            if (!this.validateForm(formData)) {
                this.hideLoading();
                return;
            }

            const planData = {
                ...formData,
                status: 'scheduled',
                factoryId: this.currentUser.uid,
                createdBy: this.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await this.db.collection('auditPlans').add(planData);
            
            this.hideLoading();
            this.closePlanningModal();
            this.loadAuditPlans();
            this.renderPlans();
            this.updateStats();
            
            this.showNotification('Audit plan created successfully', 'success');
        } catch (error) {
            console.error('Error saving audit plan:', error);
            this.hideLoading();
            this.showNotification('Error creating audit plan', 'error');
        }
    }

    async saveAsDraft() {
        try {
            this.showLoading();

            const formData = this.getFormData();
            if (!this.validateForm(formData, true)) {
                this.hideLoading();
                return;
            }

            const planData = {
                ...formData,
                status: 'draft',
                factoryId: this.currentUser.uid,
                createdBy: this.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await this.db.collection('auditPlans').add(planData);
            
            this.hideLoading();
            this.closePlanningModal();
            this.loadAuditPlans();
            this.renderPlans();
            this.updateStats();
            
            this.showNotification('Draft saved successfully', 'success');
        } catch (error) {
            console.error('Error saving draft:', error);
            this.hideLoading();
            this.showNotification('Error saving draft', 'error');
        }
    }

    getFormData() {
        return {
            title: document.getElementById('planTitle').value,
            auditType: document.getElementById('modalAuditType').value,
            standard: document.getElementById('modalAuditStandard').value,
            scope: document.getElementById('modalAuditScope').value,
            department: document.getElementById('modalDepartment').value,
            priority: document.getElementById('auditPriority').value,
            startDate: document.getElementById('modalStartDate').value,
            endDate: document.getElementById('modalEndDate').value,
            startTime: document.getElementById('startTime').value,
            endTime: document.getElementById('endTime').value,
            timeZone: document.getElementById('timeZone').value,
            leadAuditor: document.getElementById('leadAuditor').value,
            teamMembers: Array.from(document.getElementById('teamMembers').selectedOptions).map(opt => opt.value),
            externalAuditors: document.getElementById('externalAuditors').value,
            observer: document.getElementById('observer').value,
            objectives: document.getElementById('auditObjectives').value,
            criteria: document.getElementById('auditCriteria').value,
            scopeDescription: document.getElementById('scopeDescription').value,
            riskLevel: document.getElementById('riskLevel').value,
            previousFindings: document.getElementById('previousFindings').value,
            riskFactors: document.getElementById('riskFactors').value,
            requiredResources: document.getElementById('requiredResources').value,
            logisticsNotes: document.getElementById('logisticsNotes').value,
            openingMeeting: document.getElementById('openingMeeting').value,
            closingMeeting: document.getElementById('closingMeeting').value,
            stakeholders: document.getElementById('stakeholders').value
        };
    }

    validateForm(data, isDraft = false) {
        const requiredFields = isDraft ? ['title'] : [
            'title', 'auditType', 'standard', 'scope', 'startDate', 
            'endDate', 'leadAuditor', 'objectives'
        ];

        for (const field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                this.showNotification(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`, 'error');
                return false;
            }
        }

        if (data.startDate && data.endDate) {
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);
            if (end < start) {
                this.showNotification('End date cannot be before start date', 'error');
                return false;
            }
        }

        return true;
    }

    renderPlans() {
        const grid = document.getElementById('planningGrid');
        if (!grid) return;

        if (this.filteredPlans.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="calendar"></i>
                    <p>No audit plans found</p>
                    <button class="btn btn-primary" onclick="auditPlanner.openPlanningModal()">
                        Create Your First Plan
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.filteredPlans.map(plan => this.renderPlanCard(plan)).join('');
        
        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    renderPlanCard(plan) {
        const statusClass = `status-${plan.status}`;
        const priorityClass = `priority-${plan.priority}`;
        const startDate = new Date(plan.startDate).toLocaleDateString();
        const endDate = new Date(plan.endDate).toLocaleDateString();

        return `
            <div class="plan-card" onclick="auditPlanner.openDetailsModal('${plan.id}')">
                <div class="plan-header">
                    <div class="plan-icon">
                        <i data-lucide="calendar"></i>
                    </div>
                    <div class="plan-status">
                        <span class="status-badge ${statusClass}">${plan.status}</span>
                        <span class="priority-badge ${priorityClass}">${plan.priority}</span>
                    </div>
                </div>
                <div class="plan-content">
                    <h3>${plan.title}</h3>
                    <div class="plan-meta">
                        <span class="type">${plan.auditType}</span>
                        <span class="standard">${plan.standard}</span>
                        <span class="scope">${plan.scope}</span>
                    </div>
                    <p class="plan-description">${plan.objectives || 'No objectives defined'}</p>
                    <div class="plan-dates">
                        <span><i data-lucide="calendar"></i> ${startDate} - ${endDate}</span>
                    </div>
                </div>
                <div class="plan-footer">
                    <div class="plan-team">
                        <span>Lead: ${this.getAuditorName(plan.leadAuditor)}</span>
                    </div>
                    <div class="plan-actions">
                        <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); auditPlanner.editPlan('${plan.id}')">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); auditPlanner.duplicatePlan('${plan.id}')">
                            <i data-lucide="copy"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getAuditorName(auditorId) {
        // This would be populated from the auditors list
        return auditorId || 'Unassigned';
    }

    filterPlans() {
        const statusFilter = document.getElementById('filterStatus').value;
        const typeFilter = document.getElementById('filterType').value;

        this.filteredPlans = this.auditPlans.filter(plan => {
            const statusMatch = statusFilter === 'all' || plan.status === statusFilter;
            const typeMatch = typeFilter === 'all' || plan.auditType === typeFilter;
            return statusMatch && typeMatch;
        });

        this.renderPlans();
    }

    updateStats() {
        const activePlans = this.auditPlans.filter(plan => 
            ['scheduled', 'in_progress'].includes(plan.status)
        ).length;

        const upcomingAudits = this.auditPlans.filter(plan => 
            plan.status === 'scheduled' && new Date(plan.startDate) > new Date()
        ).length;

        const completedAudits = this.auditPlans.filter(plan => 
            plan.status === 'completed'
        ).length;

        document.getElementById('activePlans').textContent = activePlans;
        document.getElementById('upcomingAudits').textContent = upcomingAudits;
        document.getElementById('completedAudits').textContent = completedAudits;
    }

    openTemplateModal() {
        const modal = document.getElementById('templateModal');
        const grid = document.getElementById('templateGrid');
        
        if (modal && grid) {
            modal.style.display = 'flex';
            this.renderTemplates();
        }
    }

    closeTemplateModal() {
        const modal = document.getElementById('templateModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    renderTemplates() {
        const grid = document.getElementById('templateGrid');
        if (!grid) return;

        if (this.templates.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="file-text"></i>
                    <p>No templates available</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.templates.map(template => `
            <div class="template-card" onclick="auditPlanner.useTemplate('${template.id}')">
                <div class="template-header">
                    <h3>${template.name}</h3>
                    <span class="template-type">${template.auditType}</span>
                </div>
                <p>${template.description}</p>
                <div class="template-meta">
                    <span>Standard: ${template.standard}</span>
                    <span>Scope: ${template.scope}</span>
                </div>
            </div>
        `).join('');
    }

    useTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (template) {
            this.closeTemplateModal();
            this.openPlanningModal();
            this.populateFormFromTemplate(template);
        }
    }

    populateFormFromTemplate(template) {
        // Populate form fields with template data
        if (template.title) document.getElementById('planTitle').value = template.title;
        if (template.auditType) document.getElementById('modalAuditType').value = template.auditType;
        if (template.standard) document.getElementById('modalAuditStandard').value = template.standard;
        if (template.scope) document.getElementById('modalAuditScope').value = template.scope;
        if (template.objectives) document.getElementById('auditObjectives').value = template.objectives;
        if (template.criteria) document.getElementById('auditCriteria').value = template.criteria;
        
        this.updateModalScope();
    }

    openDetailsModal(planId) {
        const plan = this.auditPlans.find(p => p.id === planId);
        if (!plan) return;

        this.currentPlan = plan;
        const modal = document.getElementById('planDetailsModal');
        const content = document.getElementById('planDetailsContent');
        const statusBadge = document.getElementById('planStatusBadge');
        
        if (modal && content && statusBadge) {
            modal.style.display = 'flex';
            statusBadge.textContent = plan.status;
            statusBadge.className = `status-badge status-${plan.status}`;
            content.innerHTML = this.renderPlanDetails(plan);
        }
    }

    closeDetailsModal() {
        const modal = document.getElementById('planDetailsModal');
        if (modal) {
            modal.style.display = 'none';
            this.currentPlan = null;
        }
    }

    renderPlanDetails(plan) {
        const startDate = new Date(plan.startDate).toLocaleDateString();
        const endDate = new Date(plan.endDate).toLocaleDateString();

        return `
            <div class="plan-details">
                <div class="detail-section">
                    <h3>Basic Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Title:</label>
                            <span>${plan.title}</span>
                        </div>
                        <div class="detail-item">
                            <label>Type:</label>
                            <span>${plan.auditType}</span>
                        </div>
                        <div class="detail-item">
                            <label>Standard:</label>
                            <span>${plan.standard}</span>
                        </div>
                        <div class="detail-item">
                            <label>Scope:</label>
                            <span>${plan.scope}</span>
                        </div>
                        <div class="detail-item">
                            <label>Priority:</label>
                            <span class="priority-badge priority-${plan.priority}">${plan.priority}</span>
                        </div>
                        <div class="detail-item">
                            <label>Department:</label>
                            <span>${plan.department || 'All Departments'}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Schedule</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Start Date:</label>
                            <span>${startDate}</span>
                        </div>
                        <div class="detail-item">
                            <label>End Date:</label>
                            <span>${endDate}</span>
                        </div>
                        <div class="detail-item">
                            <label>Time:</label>
                            <span>${plan.startTime} - ${plan.endTime}</span>
                        </div>
                        <div class="detail-item">
                            <label>Time Zone:</label>
                            <span>${plan.timeZone}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Team</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Lead Auditor:</label>
                            <span>${this.getAuditorName(plan.leadAuditor)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Team Members:</label>
                            <span>${plan.teamMembers ? plan.teamMembers.length : 0} members</span>
                        </div>
                        <div class="detail-item">
                            <label>External Auditors:</label>
                            <span>${plan.externalAuditors || 'None'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Observer:</label>
                            <span>${plan.observer || 'None'}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Objectives & Criteria</h3>
                    <div class="detail-content">
                        <div class="detail-item">
                            <label>Objectives:</label>
                            <p>${plan.objectives}</p>
                        </div>
                        <div class="detail-item">
                            <label>Criteria:</label>
                            <p>${plan.criteria || 'Not specified'}</p>
                        </div>
                        <div class="detail-item">
                            <label>Scope Description:</label>
                            <p>${plan.scopeDescription || 'Not specified'}</p>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Risk Assessment</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Risk Level:</label>
                            <span class="risk-badge risk-${plan.riskLevel}">${plan.riskLevel}</span>
                        </div>
                        <div class="detail-item">
                            <label>Previous Findings:</label>
                            <span>${plan.previousFindings}</span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <label>Risk Factors:</label>
                        <p>${plan.riskFactors || 'None specified'}</p>
                    </div>
                </div>
            </div>
        `;
    }

    editPlan(planId) {
        const plan = this.auditPlans.find(p => p.id === planId);
        if (plan) {
            this.currentPlan = plan;
            this.openPlanningModal();
            this.populateFormFromPlan(plan);
        }
    }

    populateFormFromPlan(plan) {
        // Populate form fields with existing plan data
        document.getElementById('planTitle').value = plan.title;
        document.getElementById('modalAuditType').value = plan.auditType;
        document.getElementById('modalAuditStandard').value = plan.standard;
        document.getElementById('modalAuditScope').value = plan.scope;
        document.getElementById('modalDepartment').value = plan.department;
        document.getElementById('auditPriority').value = plan.priority;
        document.getElementById('modalStartDate').value = plan.startDate;
        document.getElementById('modalEndDate').value = plan.endDate;
        document.getElementById('startTime').value = plan.startTime;
        document.getElementById('endTime').value = plan.endTime;
        document.getElementById('timeZone').value = plan.timeZone;
        document.getElementById('leadAuditor').value = plan.leadAuditor;
        document.getElementById('externalAuditors').value = plan.externalAuditors;
        document.getElementById('observer').value = plan.observer;
        document.getElementById('auditObjectives').value = plan.objectives;
        document.getElementById('auditCriteria').value = plan.criteria;
        document.getElementById('scopeDescription').value = plan.scopeDescription;
        document.getElementById('riskLevel').value = plan.riskLevel;
        document.getElementById('previousFindings').value = plan.previousFindings;
        document.getElementById('riskFactors').value = plan.riskFactors;
        document.getElementById('requiredResources').value = plan.requiredResources;
        document.getElementById('logisticsNotes').value = plan.logisticsNotes;
        document.getElementById('openingMeeting').value = plan.openingMeeting;
        document.getElementById('closingMeeting').value = plan.closingMeeting;
        document.getElementById('stakeholders').value = plan.stakeholders;

        this.updateModalScope();
        this.calculateDuration();
    }

    async duplicatePlan(planId) {
        const plan = this.auditPlans.find(p => p.id === planId);
        if (plan) {
            const duplicatedPlan = {
                ...plan,
                title: `${plan.title} (Copy)`,
                status: 'draft',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            delete duplicatedPlan.id;

            try {
                await this.db.collection('auditPlans').add(duplicatedPlan);
                this.loadAuditPlans();
                this.renderPlans();
                this.updateStats();
                this.showNotification('Plan duplicated successfully', 'success');
            } catch (error) {
                console.error('Error duplicating plan:', error);
                this.showNotification('Error duplicating plan', 'error');
            }
        }
    }

    async startAudit() {
        if (!this.currentPlan) return;

        try {
            await this.db.collection('auditPlans').doc(this.currentPlan.id).update({
                status: 'in_progress',
                startedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.closeDetailsModal();
            this.loadAuditPlans();
            this.renderPlans();
            this.updateStats();
            this.showNotification('Audit started successfully', 'success');
        } catch (error) {
            console.error('Error starting audit:', error);
            this.showNotification('Error starting audit', 'error');
        }
    }

    async exportPlans() {
        try {
            const csvContent = this.generateCSV();
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit_plans_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting plans:', error);
            this.showNotification('Error exporting plans', 'error');
        }
    }

    generateCSV() {
        const headers = ['Title', 'Type', 'Standard', 'Scope', 'Status', 'Start Date', 'End Date', 'Lead Auditor', 'Priority'];
        const rows = this.filteredPlans.map(plan => [
            plan.title,
            plan.auditType,
            plan.standard,
            plan.scope,
            plan.status,
            plan.startDate,
            plan.endDate,
            this.getAuditorName(plan.leadAuditor),
            plan.priority
        ]);

        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem;
            border-radius: 6px;
            color: white;
            z-index: 3000;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the audit planner
const auditPlanner = new AuditPlanner();

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    auditPlanner.init();
});
