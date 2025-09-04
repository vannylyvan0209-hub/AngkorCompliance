// Training Matrix System
// Manages role-based training requirements and compliance tracking
// Supports training program management, bulk assignments, and compliance reporting

class TrainingMatrix {
    constructor() {
        this.currentLanguage = 'en';
        this.trainingPrograms = [];
        this.trainingMatrix = [];
        this.workers = [];
        this.currentFilters = {
            department: '',
            role: '',
            standard: '',
            status: ''
        };
        this.initializeSystem();
    }

    initializeSystem() {
        this.setupEventListeners();
        this.loadTrainingData();
        this.loadWorkers();
        this.updateLanguage();
        this.renderMatrix();
        this.renderPrograms();
    }

    setupEventListeners() {
        // Language toggle
        const languageToggle = document.getElementById('language-toggle');
        if (languageToggle) {
            languageToggle.addEventListener('click', () => this.toggleLanguage());
        }

        // Export button
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportMatrix());
        }

        // Add program button
        const addProgramBtn = document.getElementById('add-program-btn');
        if (addProgramBtn) {
            addProgramBtn.addEventListener('click', () => this.openModal('add-program-modal'));
        }

        // Filter controls
        const filterSelects = ['department-filter', 'role-filter', 'standard-filter', 'status-filter'];
        filterSelects.forEach(filterId => {
            const select = document.getElementById(filterId);
            if (select) {
                select.addEventListener('change', (e) => {
                    this.currentFilters[filterId.replace('-filter', '')] = e.target.value;
                    this.applyFilters();
                });
            }
        });

        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Bulk assignment controls
        this.setupBulkAssignmentControls();
    }

    setupBulkAssignmentControls() {
        const selectAllBtn = document.getElementById('select-all-btn');
        const clearSelectionBtn = document.getElementById('clear-selection-btn');
        const bulkDepartment = document.getElementById('bulk-department');
        const bulkRole = document.getElementById('bulk-role');

        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => this.selectAllWorkers());
        }

        if (clearSelectionBtn) {
            clearSelectionBtn.addEventListener('click', () => this.clearWorkerSelection());
        }

        if (bulkDepartment) {
            bulkDepartment.addEventListener('change', () => this.filterWorkersForBulk());
        }

        if (bulkRole) {
            bulkRole.addEventListener('change', () => this.filterWorkersForBulk());
        }
    }

    loadTrainingData() {
        // Sample training programs data
        this.trainingPrograms = [
            {
                id: 'tp001',
                name: 'Safety Awareness Training',
                description: 'Basic safety protocols and emergency procedures',
                standard: 'iso45001',
                frequency: 'annual',
                duration: 4,
                validity: 12,
                roles: ['worker', 'supervisor'],
                departments: ['production', 'maintenance'],
                createdAt: new Date('2024-01-01')
            },
            {
                id: 'tp002',
                name: 'Quality Management System',
                description: 'ISO 9001 quality management principles and procedures',
                standard: 'iso9001',
                frequency: 'annual',
                duration: 8,
                validity: 24,
                roles: ['supervisor', 'manager', 'specialist'],
                departments: ['quality', 'management'],
                createdAt: new Date('2024-01-01')
            },
            {
                id: 'tp003',
                name: 'Environmental Management',
                description: 'ISO 14001 environmental management and compliance',
                standard: 'iso14001',
                frequency: 'annual',
                duration: 6,
                validity: 18,
                roles: ['manager', 'specialist'],
                departments: ['management', 'hr'],
                createdAt: new Date('2024-01-01')
            },
            {
                id: 'tp004',
                name: 'Social Compliance Training',
                description: 'SA8000 social accountability standards',
                standard: 'sa8000',
                frequency: 'annual',
                duration: 3,
                validity: 12,
                roles: ['worker', 'supervisor', 'manager'],
                departments: ['production', 'hr', 'management'],
                createdAt: new Date('2024-01-01')
            }
        ];

        // Generate training matrix data
        this.generateTrainingMatrix();
    }

    loadWorkers() {
        // Sample workers data
        this.workers = [
            { id: 'w001', name: 'Sok Dara', department: 'production', role: 'worker', email: 'sok.dara@factory.com' },
            { id: 'w002', name: 'Chan Sopheak', department: 'production', role: 'supervisor', email: 'chan.sopheak@factory.com' },
            { id: 'w003', name: 'Kong Vuthy', department: 'quality', role: 'specialist', email: 'kong.vuthy@factory.com' },
            { id: 'w004', name: 'Ly Sreyneang', department: 'hr', role: 'manager', email: 'ly.sreyneang@factory.com' },
            { id: 'w005', name: 'Heng Samnang', department: 'maintenance', role: 'worker', email: 'heng.samnang@factory.com' },
            { id: 'w006', name: 'Nou Sothea', department: 'management', role: 'manager', email: 'nou.sothea@factory.com' }
        ];
    }

    generateTrainingMatrix() {
        this.trainingMatrix = [];
        
        this.workers.forEach(worker => {
            this.trainingPrograms.forEach(program => {
                if (this.isProgramApplicable(worker, program)) {
                    const matrixEntry = {
                        workerId: worker.id,
                        workerName: worker.name,
                        department: worker.department,
                        role: worker.role,
                        programId: program.id,
                        programName: program.name,
                        standard: program.standard,
                        frequency: program.frequency,
                        lastCompleted: this.getLastCompletedDate(worker.id, program.id),
                        nextDue: this.calculateNextDueDate(worker.id, program.id, program),
                        status: this.calculateStatus(worker.id, program.id, program)
                    };
                    this.trainingMatrix.push(matrixEntry);
                }
            });
        });
    }

    isProgramApplicable(worker, program) {
        return program.roles.includes(worker.role) && 
               program.departments.includes(worker.department);
    }

    getLastCompletedDate(workerId, programId) {
        // In a real implementation, this would come from the database
        const randomDays = Math.floor(Math.random() * 365);
        const date = new Date();
        date.setDate(date.getDate() - randomDays);
        return date.toISOString().split('T')[0];
    }

    calculateNextDueDate(workerId, programId, program) {
        const lastCompleted = this.getLastCompletedDate(workerId, programId);
        const lastDate = new Date(lastCompleted);
        
        switch (program.frequency) {
            case 'annual':
                lastDate.setFullYear(lastDate.getFullYear() + 1);
                break;
            case 'biannual':
                lastDate.setMonth(lastDate.getMonth() + 6);
                break;
            case 'quarterly':
                lastDate.setMonth(lastDate.getMonth() + 3);
                break;
            case 'monthly':
                lastDate.setMonth(lastDate.getMonth() + 1);
                break;
            default:
                return null; // Once
        }
        
        return lastDate.toISOString().split('T')[0];
    }

    calculateStatus(workerId, programId, program) {
        const nextDue = this.calculateNextDueDate(workerId, programId, program);
        if (!nextDue) return 'completed'; // One-time training
        
        const today = new Date();
        const dueDate = new Date(nextDue);
        
        if (dueDate < today) {
            return 'expired';
        } else if (dueDate.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1000) { // 30 days
            return 'in-progress';
        } else {
            return 'required';
        }
    }

    applyFilters() {
        let filteredMatrix = this.trainingMatrix;
        
        if (this.currentFilters.department) {
            filteredMatrix = filteredMatrix.filter(entry => 
                entry.department === this.currentFilters.department
            );
        }
        
        if (this.currentFilters.role) {
            filteredMatrix = filteredMatrix.filter(entry => 
                entry.role === this.currentFilters.role
            );
        }
        
        if (this.currentFilters.standard) {
            filteredMatrix = filteredMatrix.filter(entry => 
                entry.standard === this.currentFilters.standard
            );
        }
        
        if (this.currentFilters.status) {
            filteredMatrix = filteredMatrix.filter(entry => 
                entry.status === this.currentFilters.status
            );
        }
        
        this.renderMatrix(filteredMatrix);
    }

    renderMatrix(matrixData = this.trainingMatrix) {
        const tbody = document.getElementById('matrix-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        matrixData.forEach(entry => {
            const row = document.createElement('tr');
            row.className = `status-${entry.status}`;
            
            row.innerHTML = `
                <td>
                    <div class="worker-info">
                        <strong>${entry.workerName}</strong><br>
                        <span class="role-dept">${this.capitalizeFirst(entry.role)} - ${this.capitalizeFirst(entry.department)}</span>
                    </div>
                </td>
                <td>${entry.programName}</td>
                <td><span class="standard-badge standard-${entry.standard}">${entry.standard.toUpperCase()}</span></td>
                <td>${this.capitalizeFirst(entry.frequency)}</td>
                <td>${entry.lastCompleted || 'Never'}</td>
                <td>${entry.nextDue || 'N/A'}</td>
                <td><span class="status-badge status-${entry.status}">${this.getStatusText(entry.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="trainingMatrix.assignTraining('${entry.workerId}', '${entry.programId}')">
                            <i class="fas fa-play"></i> Start
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="trainingMatrix.viewProgress('${entry.workerId}', '${entry.programId}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    renderPrograms() {
        const programsGrid = document.getElementById('programs-grid');
        if (!programsGrid) return;

        programsGrid.innerHTML = '';
        
        this.trainingPrograms.forEach(program => {
            const programCard = document.createElement('div');
            programCard.className = 'program-card';
            
            programCard.innerHTML = `
                <div class="program-header">
                    <h3>${program.name}</h3>
                    <span class="standard-badge standard-${program.standard}">${program.standard.toUpperCase()}</span>
                </div>
                <p class="program-description">${program.description}</p>
                <div class="program-details">
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${program.duration}h</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <span>${this.capitalizeFirst(program.frequency)}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-calendar-check"></i>
                        <span>${program.validity} months</span>
                    </div>
                </div>
                <div class="program-applicability">
                    <div class="applicable-roles">
                        <strong>Roles:</strong> ${program.roles.map(r => this.capitalizeFirst(r)).join(', ')}
                    </div>
                    <div class="applicable-departments">
                        <strong>Departments:</strong> ${program.departments.map(d => this.capitalizeFirst(d)).join(', ')}
                    </div>
                </div>
                <div class="program-actions">
                    <button class="btn btn-sm btn-primary" onclick="trainingMatrix.editProgram('${program.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="trainingMatrix.viewProgramDetails('${program.id}')">
                        <i class="fas fa-eye"></i> Details
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="trainingMatrix.deleteProgram('${program.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            programsGrid.appendChild(programCard);
        });
    }

    assignTraining(workerId, programId) {
        // In a real implementation, this would create a training assignment
        console.log(`Assigning training ${programId} to worker ${workerId}`);
        this.showNotification('Training assigned successfully!', 'success');
    }

    viewProgress(workerId, programId) {
        // In a real implementation, this would show training progress
        console.log(`Viewing progress for worker ${workerId} in program ${programId}`);
        this.showNotification('Opening training progress...', 'info');
    }

    editProgram(programId) {
        // In a real implementation, this would open edit mode
        console.log(`Editing program ${programId}`);
        this.showNotification('Opening program editor...', 'info');
    }

    viewProgramDetails(programId) {
        // In a real implementation, this would show detailed view
        console.log(`Viewing details for program ${programId}`);
        this.showNotification('Opening program details...', 'info');
    }

    deleteProgram(programId) {
        if (confirm('Are you sure you want to delete this training program?')) {
            this.trainingPrograms = this.trainingPrograms.filter(p => p.id !== programId);
            this.generateTrainingMatrix();
            this.renderPrograms();
            this.renderMatrix();
            this.showNotification('Training program deleted successfully!', 'success');
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    saveTrainingProgram() {
        const form = document.getElementById('add-program-form');
        if (!form) return;

        const formData = new FormData(form);
        const programData = {
            id: 'tp' + Date.now(),
            name: formData.get('program-name') || document.getElementById('program-name').value,
            description: formData.get('program-description') || document.getElementById('program-description').value,
            standard: document.getElementById('program-standard').value,
            frequency: document.getElementById('program-frequency').value,
            duration: parseFloat(document.getElementById('program-duration').value),
            validity: parseInt(document.getElementById('program-validity').value),
            roles: Array.from(document.querySelectorAll('input[name="program-roles"]:checked')).map(cb => cb.value),
            departments: Array.from(document.querySelectorAll('input[name="program-departments"]:checked')).map(cb => cb.value),
            createdAt: new Date()
        };

        if (this.validateProgramData(programData)) {
            this.trainingPrograms.push(programData);
            this.generateTrainingMatrix();
            this.renderPrograms();
            this.renderMatrix();
            this.closeModal('add-program-modal');
            this.resetForm(form);
            this.showNotification('Training program added successfully!', 'success');
        }
    }

    validateProgramData(programData) {
        if (!programData.name || !programData.description || !programData.standard || 
            !programData.frequency || !programData.duration || !programData.validity) {
            this.showNotification('Please fill in all required fields.', 'error');
            return false;
        }

        if (programData.roles.length === 0 || programData.departments.length === 0) {
            this.showNotification('Please select at least one role and department.', 'error');
            return false;
        }

        return true;
    }

    resetForm(form) {
        form.reset();
        document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
    }

    exportMatrix() {
        // In a real implementation, this would export to CSV/Excel
        console.log('Exporting training matrix...');
        this.showNotification('Exporting training matrix...', 'info');
        
        // Simulate export
        setTimeout(() => {
            this.showNotification('Training matrix exported successfully!', 'success');
        }, 2000);
    }

    // Bulk assignment functions
    openBulkAssignment() {
        this.openModal('bulk-assignment-modal');
        this.populateBulkAssignmentData();
    }

    populateBulkAssignmentData() {
        this.populateWorkersList();
        this.populateTrainingPrograms();
        this.setDefaultDates();
    }

    populateWorkersList() {
        const workersList = document.getElementById('workers-list');
        if (!workersList) return;

        workersList.innerHTML = '';
        
        this.workers.forEach(worker => {
            const workerItem = document.createElement('div');
            workerItem.className = 'worker-item';
            workerItem.innerHTML = `
                <label class="worker-checkbox">
                    <input type="checkbox" value="${worker.id}" data-department="${worker.department}" data-role="${worker.role}">
                    <span class="worker-info">
                        <strong>${worker.name}</strong>
                        <span class="worker-details">${this.capitalizeFirst(worker.role)} - ${this.capitalizeFirst(worker.department)}</span>
                    </span>
                </label>
            `;
            workersList.appendChild(workerItem);
        });
    }

    populateTrainingPrograms() {
        const select = document.getElementById('bulk-training-program');
        if (!select) return;

        select.innerHTML = '<option value="">Select Training Program</option>';
        
        this.trainingPrograms.forEach(program => {
            const option = document.createElement('option');
            option.value = program.id;
            option.textContent = program.name;
            select.appendChild(option);
        });
    }

    setDefaultDates() {
        const startDate = document.getElementById('bulk-start-date');
        const dueDate = document.getElementById('bulk-due-date');
        
        if (startDate) {
            startDate.value = new Date().toISOString().split('T')[0];
        }
        
        if (dueDate) {
            const due = new Date();
            due.setDate(due.getDate() + 30); // 30 days from now
            dueDate.value = due.toISOString().split('T')[0];
        }
    }

    filterWorkersForBulk() {
        const department = document.getElementById('bulk-department').value;
        const role = document.getElementById('bulk-role').value;
        
        document.querySelectorAll('.worker-item').forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const workerDept = checkbox.dataset.department;
            const workerRole = checkbox.dataset.role;
            
            let show = true;
            
            if (department && workerDept !== department) show = false;
            if (role && workerRole !== role) show = false;
            
            item.style.display = show ? 'block' : 'none';
        });
    }

    selectAllWorkers() {
        document.querySelectorAll('.worker-item:not([style*="display: none"]) input[type="checkbox"]').forEach(cb => {
            cb.checked = true;
        });
    }

    clearWorkerSelection() {
        document.querySelectorAll('.worker-item input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
    }

    executeBulkAssignment() {
        const selectedWorkers = Array.from(document.querySelectorAll('#workers-list input[type="checkbox"]:checked')).map(cb => cb.value);
        const trainingProgram = document.getElementById('bulk-training-program').value;
        const startDate = document.getElementById('bulk-start-date').value;
        const dueDate = document.getElementById('bulk-due-date').value;

        if (selectedWorkers.length === 0) {
            this.showNotification('Please select at least one worker.', 'error');
            return;
        }

        if (!trainingProgram) {
            this.showNotification('Please select a training program.', 'error');
            return;
        }

        if (!startDate || !dueDate) {
            this.showNotification('Please set start and due dates.', 'error');
            return;
        }

        // In a real implementation, this would create bulk assignments
        console.log(`Bulk assigning training ${trainingProgram} to ${selectedWorkers.length} workers`);
        
        this.showNotification(`Training assigned to ${selectedWorkers.length} workers successfully!`, 'success');
        this.closeModal('bulk-assignment-modal');
    }

    // Utility functions
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getStatusText(status) {
        const statusMap = {
            'required': 'Required',
            'in-progress': 'In Progress',
            'completed': 'Completed',
            'expired': 'Expired'
        };
        return statusMap[status] || status;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button type="button" class="close-notification">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        const closeBtn = notification.querySelector('.close-notification');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => notification.remove());
        }
    }

    updateLanguage() {
        // Language update logic would go here
        // For now, we'll keep it simple
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'kh' : 'en';
        this.updateLanguage();
        
        const languageToggle = document.getElementById('language-toggle');
        if (languageToggle) {
            languageToggle.textContent = this.currentLanguage === 'en' ? 'ខ្មែរ' : 'English';
        }
    }
}

// Global functions for HTML onclick handlers
window.openBulkAssignment = function() {
    if (trainingMatrix) trainingMatrix.openBulkAssignment();
};

window.openComplianceReport = function() {
    console.log('Opening compliance report...');
    // Implementation for compliance report
};

window.openRefresherRules = function() {
    console.log('Opening refresher rules...');
    // Implementation for refresher rules
};

window.openCertificateManager = function() {
    console.log('Opening certificate manager...');
    // Implementation for certificate manager
};

window.closeModal = function(modalId) {
    if (trainingMatrix) trainingMatrix.closeModal(modalId);
};

window.saveTrainingProgram = function() {
    if (trainingMatrix) trainingMatrix.saveTrainingProgram();
};

window.executeBulkAssignment = function() {
    if (trainingMatrix) trainingMatrix.executeBulkAssignment();
};

// Initialize the system when the page loads
let trainingMatrix;
document.addEventListener('DOMContentLoaded', () => {
    trainingMatrix = new TrainingMatrix();
});
