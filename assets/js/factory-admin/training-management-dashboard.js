import { initializeFirebase } from '../../firebase-config.js';

class TrainingManagementDashboard {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.currentFactory = null;
        this.trainingPrograms = [];
        this.employeeTraining = [];
        this.trainingCategories = [];
        this.upcomingTrainings = [];
        this.trainingStats = {};
    }

    async init() {
        try {
            await initializeFirebase();
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            await this.checkAuthentication();
            this.setupEventListeners();
            await this.loadAllData();
            this.updateOverviewCards();
        } catch (error) {
            console.error('Error initializing Training Management Dashboard:', error);
            this.showError('Failed to initialize training management dashboard');
        }
    }

    async checkAuthentication() {
        return new Promise((resolve, reject) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    try {
                        // Get user's role and factory information
                        const userDoc = await this.db.collection('users').doc(user.uid).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            if (userData.role === 'factory_admin' || userData.role === 'super_admin') {
                                this.currentFactory = userData.factoryId;
                                resolve();
                            } else {
                                reject(new Error('Access denied. Factory admin role required.'));
                            }
                        } else {
                            reject(new Error('User profile not found'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(new Error('User not authenticated'));
                }
            });
        });
    }

    setupEventListeners() {
        // Employee search
        document.getElementById('employeeSearch').addEventListener('input', (e) => {
            this.filterEmployeeTraining(e.target.value);
        });

        // Training filter
        document.getElementById('trainingFilter').addEventListener('change', (e) => {
            this.filterEmployeeTrainingByStatus(e.target.value);
        });
    }

    async loadAllData() {
        try {
            await Promise.all([
                this.loadTrainingPrograms(),
                this.loadEmployeeTraining(),
                this.loadTrainingCategories(),
                this.loadUpcomingTrainings(),
                this.loadTrainingStats()
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async loadTrainingPrograms() {
        try {
            const programsSnapshot = await this.db
                .collection('training_programs')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('name')
                .get();

            this.trainingPrograms = [];
            programsSnapshot.forEach(doc => {
                const programData = doc.data();
                this.trainingPrograms.push({
                    id: doc.id,
                    ...programData
                });
            });

            this.updateProgramsGrid();
        } catch (error) {
            console.error('Error loading training programs:', error);
        }
    }

    async loadEmployeeTraining() {
        try {
            const trainingSnapshot = await this.db
                .collection('employee_training')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('employeeName')
                .get();

            this.employeeTraining = [];
            trainingSnapshot.forEach(doc => {
                const trainingData = doc.data();
                this.employeeTraining.push({
                    id: doc.id,
                    ...trainingData
                });
            });

            this.updateEmployeeTrainingTable();
        } catch (error) {
            console.error('Error loading employee training:', error);
        }
    }

    async loadTrainingCategories() {
        try {
            const categoriesSnapshot = await this.db
                .collection('training_categories')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('name')
                .get();

            this.trainingCategories = [];
            categoriesSnapshot.forEach(doc => {
                const categoryData = doc.data();
                this.trainingCategories.push({
                    id: doc.id,
                    ...categoryData
                });
            });

            this.updateCategoriesList();
        } catch (error) {
            console.error('Error loading training categories:', error);
        }
    }

    async loadUpcomingTrainings() {
        try {
            const trainingsSnapshot = await this.db
                .collection('scheduled_trainings')
                .where('factoryId', '==', this.currentFactory)
                .where('trainingDate', '>=', new Date())
                .orderBy('trainingDate', 'asc')
                .limit(10)
                .get();

            this.upcomingTrainings = [];
            trainingsSnapshot.forEach(doc => {
                const trainingData = doc.data();
                this.upcomingTrainings.push({
                    id: doc.id,
                    ...trainingData
                });
            });

            this.updateUpcomingTrainings();
        } catch (error) {
            console.error('Error loading upcoming trainings:', error);
        }
    }

    async loadTrainingStats() {
        try {
            // Calculate training statistics
            const totalEmployees = this.employeeTraining.length;
            const certifiedEmployees = this.employeeTraining.filter(training => 
                training.status === 'certified'
            ).length;
            const inProgressEmployees = this.employeeTraining.filter(training => 
                training.status === 'in_progress'
            ).length;
            const expiredEmployees = this.employeeTraining.filter(training => 
                training.status === 'expired'
            ).length;

            this.trainingStats = {
                totalEmployees,
                certifiedEmployees,
                inProgressEmployees,
                expiredEmployees,
                completionRate: totalEmployees > 0 ? Math.round((certifiedEmployees / totalEmployees) * 100) : 0
            };

            this.updateTrainingStats();
        } catch (error) {
            console.error('Error loading training stats:', error);
        }
    }

    updateProgramsGrid() {
        const container = document.getElementById('programsGrid');
        
        if (this.trainingPrograms.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="book-open"></i>
                    <p>No training programs found</p>
                    <button class="btn btn-primary" onclick="createTrainingProgram()">
                        <i data-lucide="plus"></i> Create First Program
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.trainingPrograms.map(program => `
            <div class="program-item">
                <div class="program-header">
                    <h4>${program.name}</h4>
                    <div class="program-actions">
                        <button class="btn btn-sm btn-outline" onclick="editTrainingProgram('${program.id}')">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="deleteTrainingProgram('${program.id}')">
                            <i data-lucide="trash"></i>
                        </button>
                    </div>
                </div>
                <div class="program-description">${program.description}</div>
                <div class="program-meta">
                    <div class="program-category">
                        <strong>Category:</strong> ${this.getCategoryDisplayName(program.category)}
                    </div>
                    <div class="program-duration">
                        <strong>Duration:</strong> ${program.duration} hours
                    </div>
                    <div class="program-type">
                        <strong>Type:</strong> ${this.getTrainingTypeDisplayName(program.type)}
                    </div>
                    <div class="program-validity">
                        <strong>Validity:</strong> ${program.certificationValidity} months
                    </div>
                </div>
                <div class="program-enrollment">
                    <span class="enrollment-count">${program.enrollmentCount || 0} enrolled</span>
                    <span class="completion-rate">${program.completionRate || 0}% completion</span>
                </div>
            </div>
        `).join('');
    }

    updateEmployeeTrainingTable() {
        const tableBody = document.getElementById('employeeTrainingTable');
        
        if (this.employeeTraining.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i data-lucide="user-check"></i>
                        <p>No employee training records found</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.employeeTraining.map(training => `
            <tr class="training-row ${training.status === 'expired' ? 'expired' : ''}">
                <td>
                    <div class="employee-info">
                        <div class="employee-avatar">
                            <i data-lucide="user"></i>
                        </div>
                        <div class="employee-details">
                            <div class="employee-name">${training.employeeName}</div>
                            <div class="employee-email">${training.employeeEmail}</div>
                        </div>
                    </div>
                </td>
                <td>${training.programName}</td>
                <td>
                    <span class="status-badge status-${training.status}">
                        ${this.getStatusDisplayName(training.status)}
                    </span>
                </td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${training.progress || 0}%"></div>
                    </div>
                    <span class="progress-text">${training.progress || 0}%</span>
                </td>
                <td>${this.formatDate(training.completionDate)}</td>
                <td>${this.formatDate(training.expiryDate)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline" onclick="viewEmployeeTraining('${training.id}')">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="updateEmployeeTraining('${training.id}')">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="renewCertification('${training.id}')">
                            <i data-lucide="refresh-cw"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateCategoriesList() {
        const container = document.getElementById('categoriesList');
        
        if (this.trainingCategories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="folder"></i>
                    <p>No training categories found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.trainingCategories.map(category => `
            <div class="category-item">
                <div class="category-header">
                    <h4>${category.name}</h4>
                    <span class="program-count">${category.programCount || 0} programs</span>
                </div>
                <div class="category-description">${category.description || 'No description'}</div>
                <div class="category-stats">
                    <div class="stat-item">
                        <span class="stat-label">Enrolled:</span>
                        <span class="stat-value">${category.enrolledCount || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Completed:</span>
                        <span class="stat-value">${category.completedCount || 0}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateUpcomingTrainings() {
        const container = document.getElementById('upcomingTrainings');
        
        if (this.upcomingTrainings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="clock"></i>
                    <p>No upcoming trainings scheduled</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.upcomingTrainings.map(training => `
            <div class="training-item">
                <div class="training-header">
                    <h4>${training.programName}</h4>
                    <span class="training-date">${this.formatDate(training.trainingDate)}</span>
                </div>
                <div class="training-details">
                    <div class="training-time">${training.trainingTime}</div>
                    <div class="training-location">${training.location}</div>
                    <div class="training-instructor">${training.instructor}</div>
                </div>
                <div class="training-enrollment">
                    <span class="enrolled-count">${training.enrolledCount || 0}/${training.maxParticipants} enrolled</span>
                </div>
            </div>
        `).join('');
    }

    updateTrainingStats() {
        const container = document.getElementById('trainingStats');
        
        container.innerHTML = `
            <div class="stat-item">
                <div class="stat-label">Total Programs</div>
                <div class="stat-value">${this.trainingPrograms.length}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Active Enrollments</div>
                <div class="stat-value">${this.trainingStats.inProgressEmployees}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Completion Rate</div>
                <div class="stat-value">${this.trainingStats.completionRate}%</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Avg. Training Time</div>
                <div class="stat-value">${this.calculateAverageTrainingTime()} days</div>
            </div>
        `;
    }

    filterEmployeeTraining(searchTerm) {
        const filteredTraining = this.employeeTraining.filter(training => 
            training.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            training.employeeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            training.programName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        this.updateEmployeeTrainingTableWithData(filteredTraining);
    }

    filterEmployeeTrainingByStatus(status) {
        let filteredTraining = this.employeeTraining;

        if (status !== 'all') {
            filteredTraining = this.employeeTraining.filter(training => training.status === status);
        }

        this.updateEmployeeTrainingTableWithData(filteredTraining);
    }

    updateEmployeeTrainingTableWithData(trainingData) {
        const tableBody = document.getElementById('employeeTrainingTable');
        
        if (trainingData.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i data-lucide="search"></i>
                        <p>No training records found matching your criteria</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = trainingData.map(training => `
            <tr class="training-row ${training.status === 'expired' ? 'expired' : ''}">
                <td>
                    <div class="employee-info">
                        <div class="employee-avatar">
                            <i data-lucide="user"></i>
                        </div>
                        <div class="employee-details">
                            <div class="employee-name">${training.employeeName}</div>
                            <div class="employee-email">${training.employeeEmail}</div>
                        </div>
                    </div>
                </td>
                <td>${training.programName}</td>
                <td>
                    <span class="status-badge status-${training.status}">
                        ${this.getStatusDisplayName(training.status)}
                    </span>
                </td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${training.progress || 0}%"></div>
                    </div>
                    <span class="progress-text">${training.progress || 0}%</span>
                </td>
                <td>${this.formatDate(training.completionDate)}</td>
                <td>${this.formatDate(training.expiryDate)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-outline" onclick="viewEmployeeTraining('${training.id}')">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="updateEmployeeTraining('${training.id}')">
                            <i data-lucide="edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="renewCertification('${training.id}')">
                            <i data-lucide="refresh-cw"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateOverviewCards() {
        const totalEmployees = this.trainingStats.totalEmployees;
        const certifiedEmployees = this.trainingStats.certifiedEmployees;
        const inProgressEmployees = this.trainingStats.inProgressEmployees;
        const expiredEmployees = this.trainingStats.expiredEmployees;

        // Update card values
        document.querySelector('.overview-card:nth-child(1) .card-value').textContent = totalEmployees;
        document.querySelector('.overview-card:nth-child(2) .card-value').textContent = certifiedEmployees;
        document.querySelector('.overview-card:nth-child(3) .card-value').textContent = inProgressEmployees;
        document.querySelector('.overview-card:nth-child(4) .card-value').textContent = expiredEmployees;
    }

    calculateAverageTrainingTime() {
        // Calculate average training completion time
        const completedTraining = this.employeeTraining.filter(training => 
            training.status === 'certified' && training.completionDate
        );

        if (completedTraining.length === 0) return 0;

        let totalDays = 0;
        completedTraining.forEach(training => {
            const startDate = new Date(training.startDate);
            const completionDate = new Date(training.completionDate);
            const daysDiff = Math.ceil((completionDate - startDate) / (1000 * 60 * 60 * 24));
            totalDays += daysDiff;
        });

        return Math.round(totalDays / completedTraining.length);
    }

    // Helper methods
    getCategoryDisplayName(category) {
        const categoryNames = {
            'safety': 'Safety Training',
            'compliance': 'Compliance Training',
            'technical': 'Technical Training',
            'soft_skills': 'Soft Skills',
            'management': 'Management Training'
        };
        return categoryNames[category] || category;
    }

    getTrainingTypeDisplayName(type) {
        const typeNames = {
            'online': 'Online Training',
            'classroom': 'Classroom Training',
            'hybrid': 'Hybrid Training',
            'on_the_job': 'On-the-Job Training'
        };
        return typeNames[type] || type;
    }

    getStatusDisplayName(status) {
        const statusNames = {
            'not_started': 'Not Started',
            'in_progress': 'In Progress',
            'certified': 'Certified',
            'expired': 'Expired'
        };
        return statusNames[status] || status;
    }

    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
    }

    showLoading(message) {
        // Implement loading indicator
        console.log('Loading:', message);
    }

    hideLoading() {
        // Hide loading indicator
        console.log('Loading complete');
    }

    showSuccess(message) {
        // Implement success notification
        alert(message); // Replace with proper notification system
    }

    showError(message) {
        // Implement error notification
        alert('Error: ' + message); // Replace with proper notification system
    }
}

// Global functions for button actions
let trainingManagementDashboard;

function createTrainingProgram() {
    document.getElementById('createTrainingModal').style.display = 'flex';
}

function importTrainingData() {
    alert('Import Training Data feature coming soon');
}

function scheduleTraining() {
    document.getElementById('scheduleTrainingModal').style.display = 'flex';
}

function exportCalendar() {
    alert('Export Calendar feature coming soon');
}

function bulkAssignTraining() {
    alert('Bulk Assign Training feature coming soon');
}

function generateReport() {
    alert('Generate Training Report feature coming soon');
}

function certificationAudit() {
    alert('Certification Audit feature coming soon');
}

function trainingAnalytics() {
    alert('Training Analytics feature coming soon');
}

function complianceCheck() {
    alert('Compliance Check feature coming soon');
}

function trainingResources() {
    alert('Training Resources feature coming soon');
}

function editTrainingProgram(programId) {
    alert('Edit Training Program feature coming soon');
}

function deleteTrainingProgram(programId) {
    if (confirm('Are you sure you want to delete this training program?')) {
        alert('Delete Training Program feature coming soon');
    }
}

function saveTrainingProgram() {
    alert('Save Training Program feature coming soon');
}

function saveScheduledTraining() {
    alert('Save Scheduled Training feature coming soon');
}

function viewEmployeeTraining(trainingId) {
    document.getElementById('employeeTrainingModal').style.display = 'flex';
    // Load employee training details
    alert('View Employee Training feature coming soon');
}

function updateEmployeeTraining(trainingId) {
    alert('Update Employee Training feature coming soon');
}

function renewCertification(trainingId) {
    if (confirm('Are you sure you want to renew this certification?')) {
        alert('Renew Certification feature coming soon');
    }
}

function markTrainingComplete() {
    alert('Mark Training Complete feature coming soon');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    trainingManagementDashboard = new TrainingManagementDashboard();
    window.trainingManagementDashboard = trainingManagementDashboard;
    trainingManagementDashboard.init();
});
