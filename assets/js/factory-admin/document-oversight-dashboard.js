import { initializeFirebase } from '../../firebase-config.js';

class DocumentOversightDashboard {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.currentFactory = null;
        this.documents = [];
        this.filteredDocuments = [];
        this.filters = {
            status: '',
            department: ''
        };
        this.chart = null;
        this.activities = [];
    }

    async init() {
        try {
            await initializeFirebase();
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            await this.checkAuthentication();
            await this.loadFactoryData();
            this.setupEventListeners();
            await this.loadDocuments();
            await this.loadActivities();
            this.initializeChart();
            this.updateStatistics();
        } catch (error) {
            console.error('Error initializing Document Oversight Dashboard:', error);
            this.showError('Failed to initialize dashboard');
        }
    }

    async checkAuthentication() {
        return new Promise((resolve, reject) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    try {
                        // Get user's factory information
                        const userDoc = await this.db.collection('users').doc(user.uid).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            if (userData.role === 'factory_admin' && userData.factoryId) {
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

    async loadFactoryData() {
        try {
            const factoryDoc = await this.db.collection('factories').doc(this.currentFactory).get();
            if (factoryDoc.exists) {
                const factoryData = factoryDoc.data();
                document.title = `Document Oversight Dashboard - ${factoryData.name} - Angkor Compliance`;
            }
        } catch (error) {
            console.error('Error loading factory data:', error);
        }
    }

    setupEventListeners() {
        // Filter events
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.applyFilters();
        });

        document.getElementById('departmentFilter').addEventListener('change', (e) => {
            this.filters.department = e.target.value;
            this.applyFilters();
        });

        // Real-time listeners
        this.setupRealtimeListeners();
    }

    async loadDocuments() {
        try {
            this.showLoading();
            
            const documentsSnapshot = await this.db
                .collection('documents')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('submittedAt', 'desc')
                .limit(50)
                .get();

            this.documents = [];
            documentsSnapshot.forEach(doc => {
                const docData = doc.data();
                this.documents.push({
                    id: doc.id,
                    ...docData,
                    submittedAt: docData.submittedAt?.toDate() || new Date(),
                    reviewedAt: docData.reviewedAt?.toDate() || null,
                    dueDate: docData.dueDate?.toDate() || null
                });
            });

            this.filteredDocuments = [...this.documents];
            this.updateDocumentsTable();
            this.updateStatistics();
        } catch (error) {
            console.error('Error loading documents:', error);
            this.showError('Failed to load documents');
        } finally {
            this.hideLoading();
        }
    }

    async loadActivities() {
        try {
            const activitiesSnapshot = await this.db
                .collection('document_activities')
                .where('factoryId', '==', this.currentFactory)
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get();

            this.activities = [];
            activitiesSnapshot.forEach(doc => {
                const activityData = doc.data();
                this.activities.push({
                    id: doc.id,
                    ...activityData,
                    timestamp: activityData.timestamp?.toDate() || new Date()
                });
            });

            this.updateActivityList();
        } catch (error) {
            console.error('Error loading activities:', error);
        }
    }

    setupRealtimeListeners() {
        // Listen for real-time updates to documents
        this.db
            .collection('documents')
            .where('factoryId', '==', this.currentFactory)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added' || change.type === 'modified') {
                        const docData = change.doc.data();
                        const document = {
                            id: change.doc.id,
                            ...docData,
                            submittedAt: docData.submittedAt?.toDate() || new Date(),
                            reviewedAt: docData.reviewedAt?.toDate() || null,
                            dueDate: docData.dueDate?.toDate() || null
                        };

                        const existingIndex = this.documents.findIndex(d => d.id === document.id);
                        if (existingIndex >= 0) {
                            this.documents[existingIndex] = document;
                        } else {
                            this.documents.unshift(document);
                        }
                    } else if (change.type === 'removed') {
                        this.documents = this.documents.filter(d => d.id !== change.doc.id);
                    }
                });

                this.applyFilters();
                this.updateStatistics();
                this.updateChart();
            });

        // Listen for real-time updates to activities
        this.db
            .collection('document_activities')
            .where('factoryId', '==', this.currentFactory)
            .orderBy('timestamp', 'desc')
            .limit(10)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const activityData = change.doc.data();
                        const activity = {
                            id: change.doc.id,
                            ...activityData,
                            timestamp: activityData.timestamp?.toDate() || new Date()
                        };

                        this.activities.unshift(activity);
                        if (this.activities.length > 10) {
                            this.activities.pop();
                        }
                    }
                });

                this.updateActivityList();
            });
    }

    applyFilters() {
        this.filteredDocuments = this.documents.filter(doc => {
            const matchesStatus = !this.filters.status || doc.status === this.filters.status;
            const matchesDepartment = !this.filters.department || doc.department === this.filters.department;
            return matchesStatus && matchesDepartment;
        });

        this.updateDocumentsTable();
    }

    updateDocumentsTable() {
        const tableBody = document.getElementById('documentsTableBody');
        
        if (this.filteredDocuments.length === 0) {
            tableBody.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="file-text"></i>
                    <h3>No documents found</h3>
                    <p>${this.filters.status || this.filters.department ? 'Try adjusting your filters' : 'Documents will appear here as they are submitted for review'}</p>
                </div>
            `;
            return;
        }

        tableBody.innerHTML = this.filteredDocuments.map(doc => `
            <div class="table-row">
                <div>
                    <div style="font-weight: 600; color: var(--text-primary);">${doc.title}</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">${doc.description || 'No description'}</div>
                </div>
                <div>${this.getDepartmentName(doc.department)}</div>
                <div>
                    <span class="status-badge status-${doc.status}">${doc.status}</span>
                </div>
                <div>
                    <span class="priority-badge priority-${doc.priority || 'medium'}">${doc.priority || 'medium'}</span>
                </div>
                <div>${this.formatDate(doc.submittedAt)}</div>
                <div>
                    <button class="btn btn-sm btn-outline" onclick="viewDocument('${doc.id}')" title="View Document">
                        <i data-lucide="eye"></i>
                    </button>
                    ${doc.status === 'pending' ? `
                        <button class="btn btn-sm btn-success" onclick="approveDocument('${doc.id}')" title="Approve">
                            <i data-lucide="check"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="rejectDocument('${doc.id}')" title="Reject">
                            <i data-lucide="x"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');

        // Recreate icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    updateStatistics() {
        const stats = {
            pending: this.documents.filter(d => d.status === 'pending').length,
            approved: this.documents.filter(d => d.status === 'approved').length,
            rejected: this.documents.filter(d => d.status === 'rejected').length,
            overdue: this.documents.filter(d => this.isOverdue(d)).length
        };

        document.getElementById('pendingDocuments').textContent = stats.pending;
        document.getElementById('approvedDocuments').textContent = stats.approved;
        document.getElementById('rejectedDocuments').textContent = stats.rejected;
        document.getElementById('overdueDocuments').textContent = stats.overdue;

        // Update change indicators (mock data for now)
        this.updateChangeIndicators();
    }

    updateChangeIndicators() {
        // Mock change data - in a real app, this would compare with historical data
        const changes = {
            pending: '+12%',
            approved: '+8%',
            rejected: '+3%',
            overdue: '+5%'
        };

        document.getElementById('pendingChange').textContent = `${changes.pending} from last week`;
        document.getElementById('approvedChange').textContent = `${changes.approved} from last week`;
        document.getElementById('rejectedChange').textContent = `${changes.rejected} from last week`;
        document.getElementById('overdueChange').textContent = `${changes.overdue} from last week`;
    }

    updateActivityList() {
        const activityList = document.getElementById('activityList');
        
        if (this.activities.length === 0) {
            activityList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="activity"></i>
                    <h3>No recent activity</h3>
                    <p>Activity will appear here as documents are processed</p>
                </div>
            `;
            return;
        }

        activityList.innerHTML = this.activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i data-lucide="${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${this.formatRelativeTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');

        // Recreate icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    initializeChart() {
        const ctx = document.getElementById('documentTrendsChart').getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.getChartLabels(),
                datasets: [
                    {
                        label: 'Submitted',
                        data: this.getChartData('submitted'),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Approved',
                        data: this.getChartData('approved'),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Rejected',
                        data: this.getChartData('rejected'),
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    updateChart() {
        if (!this.chart) return;

        this.chart.data.labels = this.getChartLabels();
        this.chart.data.datasets[0].data = this.getChartData('submitted');
        this.chart.data.datasets[1].data = this.getChartData('approved');
        this.chart.data.datasets[2].data = this.getChartData('rejected');
        this.chart.update();
    }

    getChartLabels() {
        const days = parseInt(document.getElementById('chartTimeframe').value);
        const labels = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        return labels;
    }

    getChartData(type) {
        const days = parseInt(document.getElementById('chartTimeframe').value);
        const data = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));
            
            let count = 0;
            this.documents.forEach(doc => {
                const docDate = doc.submittedAt;
                if (docDate >= startOfDay && docDate <= endOfDay) {
                    if (type === 'submitted') {
                        count++;
                    } else if (doc.status === type) {
                        count++;
                    }
                }
            });
            
            data.push(count);
        }
        
        return data;
    }

    // Helper methods
    getDepartmentName(department) {
        const departments = {
            'hr': 'Human Resources',
            'operations': 'Operations',
            'quality': 'Quality Control',
            'safety': 'Safety & Compliance',
            'management': 'Management'
        };
        return departments[department] || department;
    }

    formatDate(date) {
        if (!date) return 'N/A';
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    }

    formatRelativeTime(date) {
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} days ago`;
        
        return this.formatDate(date);
    }

    getActivityIcon(type) {
        const icons = {
            'submitted': 'file-text',
            'approved': 'check',
            'rejected': 'x',
            'overdue': 'alert-triangle',
            'reminder': 'mail'
        };
        return icons[type] || 'activity';
    }

    isOverdue(document) {
        if (!document.dueDate) return false;
        return new Date() > document.dueDate && document.status === 'pending';
    }

    showLoading() {
        // Add loading indicator if needed
    }

    hideLoading() {
        // Remove loading indicator if needed
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
let documentOversightDashboard;

function applyFilters() {
    documentOversightDashboard.applyFilters();
}

function clearFilters() {
    document.getElementById('statusFilter').value = '';
    document.getElementById('departmentFilter').value = '';
    documentOversightDashboard.filters = { status: '', department: '' };
    documentOversightDashboard.applyFilters();
}

function updateChart() {
    documentOversightDashboard.updateChart();
}

function viewDocument(documentId) {
    // Implement document view
    alert(`View document ${documentId} - to be implemented`);
}

function approveDocument(documentId) {
    // Implement document approval
    alert(`Approve document ${documentId} - to be implemented`);
}

function rejectDocument(documentId) {
    // Implement document rejection
    alert(`Reject document ${documentId} - to be implemented`);
}

function approveAllPending() {
    // Implement bulk approval
    alert('Bulk approve all pending documents - to be implemented');
}

function sendReminders() {
    // Implement reminder sending
    alert('Send reminders for overdue documents - to be implemented');
}

function generateReport() {
    // Implement report generation
    alert('Generate compliance report - to be implemented');
}

function viewAnalytics() {
    // Implement analytics view
    alert('View detailed analytics - to be implemented');
}

function exportDocumentData() {
    // Implement data export
    alert('Export document data - to be implemented');
}

function viewAllDocuments() {
    // Navigate to all documents view
    alert('Navigate to all documents view - to be implemented');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    documentOversightDashboard = new DocumentOversightDashboard();
    window.documentOversightDashboard = documentOversightDashboard;
    documentOversightDashboard.init();
});
