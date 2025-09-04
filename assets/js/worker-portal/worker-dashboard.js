import { initializeFirebase } from '../../firebase-config.js';

class WorkerDashboard {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.workerId = null;
        this.cases = [];
        this.stats = {
            totalCases: 0,
            activeCases: 0,
            resolvedCases: 0,
            avgResolutionTime: 0
        };
    }

    async init() {
        try {
            console.log('🚀 Initializing Worker Dashboard...');
            
            // Initialize Firebase
            await initializeFirebase();
            this.db = window.Firebase?.db;
            this.auth = window.Firebase?.auth;
            
            // Check authentication
            await this.checkAuthentication();
            
            // Load dashboard data
            await this.loadDashboardData();
            
            // Set up real-time listeners
            this.setupRealtimeListeners();
            
            console.log('✅ Worker Dashboard initialized');
            
        } catch (error) {
            console.error('❌ Worker Dashboard initialization failed:', error);
            this.showError('Failed to initialize dashboard');
        }
    }

    async checkAuthentication() {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                // For worker portal, we might allow anonymous access
                // or redirect to login
                console.log('No authenticated user, checking for anonymous session...');
                this.workerId = this.getWorkerIdFromSession();
                if (!this.workerId) {
                    // Redirect to main worker portal
                    window.location.href = '../../worker-portal.html';
                    return;
                }
            } else {
                this.currentUser = user;
                this.workerId = user.uid;
            }
        } catch (error) {
            console.error('Authentication check failed:', error);
            throw error;
        }
    }

    getWorkerIdFromSession() {
        // Check for worker ID in session storage or URL params
        const urlParams = new URLSearchParams(window.location.search);
        const workerId = urlParams.get('workerId') || sessionStorage.getItem('workerId');
        return workerId;
    }

    async loadDashboardData() {
        try {
            // Load worker's cases
            await this.loadWorkerCases();
            
            // Calculate statistics
            this.calculateStatistics();
            
            // Update UI
            this.updateDashboardUI();
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async loadWorkerCases() {
        try {
            if (!this.workerId) {
                console.log('No worker ID available');
                return;
            }

            // Query cases for this worker
            const casesRef = this.db.collection('grievances');
            const query = casesRef.where('workerId', '==', this.workerId)
                                .orderBy('createdAt', 'desc')
                                .limit(10);
            
            const snapshot = await query.get();
            this.cases = [];
            
            snapshot.forEach(doc => {
                const caseData = doc.data();
                this.cases.push({
                    id: doc.id,
                    ...caseData,
                    createdAt: caseData.createdAt?.toDate(),
                    updatedAt: caseData.updatedAt?.toDate()
                });
            });

            console.log(`Loaded ${this.cases.length} cases for worker`);
            
        } catch (error) {
            console.error('Failed to load worker cases:', error);
            throw error;
        }
    }

    calculateStatistics() {
        if (this.cases.length === 0) {
            this.stats = {
                totalCases: 0,
                activeCases: 0,
                resolvedCases: 0,
                avgResolutionTime: 0
            };
            return;
        }

        const totalCases = this.cases.length;
        const activeCases = this.cases.filter(c => 
            ['new', 'assigned', 'investigating'].includes(c.status)
        ).length;
        const resolvedCases = this.cases.filter(c => 
            ['resolved', 'closed'].includes(c.status)
        ).length;

        // Calculate average resolution time
        const resolvedCasesWithDates = this.cases.filter(c => 
            c.status === 'resolved' && c.resolvedAt && c.createdAt
        );

        let totalResolutionTime = 0;
        resolvedCasesWithDates.forEach(c => {
            const resolutionTime = (c.resolvedAt - c.createdAt) / (1000 * 60 * 60 * 24); // days
            totalResolutionTime += resolutionTime;
        });

        const avgResolutionTime = resolvedCasesWithDates.length > 0 
            ? Math.round(totalResolutionTime / resolvedCasesWithDates.length)
            : 0;

        this.stats = {
            totalCases,
            activeCases,
            resolvedCases,
            avgResolutionTime
        };
    }

    updateDashboardUI() {
        // Update statistics
        document.getElementById('totalCases').textContent = this.stats.totalCases;
        document.getElementById('activeCases').textContent = this.stats.activeCases;
        document.getElementById('resolvedCases').textContent = this.stats.resolvedCases;
        document.getElementById('avgResolutionTime').textContent = this.stats.avgResolutionTime;

        // Update recent cases list
        this.updateRecentCasesList();
    }

    updateRecentCasesList() {
        const recentCasesList = document.getElementById('recentCasesList');
        
        if (this.cases.length === 0) {
            recentCasesList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="file-text"></i>
                    <h3>No cases yet</h3>
                    <p>You haven't submitted any grievances yet.</p>
                    <button class="btn btn-primary" onclick="submitNewGrievance()">
                        <i data-lucide="plus"></i> Submit Your First Grievance
                    </button>
                </div>
            `;
            return;
        }

        const casesHTML = this.cases.map(caseItem => `
            <div class="case-item" onclick="viewCaseDetails('${caseItem.id}')">
                <div class="case-info">
                    <div class="case-id">Case #${caseItem.id.slice(-8)}</div>
                    <div class="case-category">${this.capitalizeFirst(caseItem.category)}</div>
                    <div class="case-date">Submitted: ${this.formatDate(caseItem.createdAt)}</div>
                </div>
                <div class="case-status status-${caseItem.status}">
                    ${this.capitalizeFirst(caseItem.status)}
                </div>
            </div>
        `).join('');

        recentCasesList.innerHTML = casesHTML;
    }

    setupRealtimeListeners() {
        if (!this.workerId) return;

        // Listen for real-time updates to worker's cases
        const casesRef = this.db.collection('grievances');
        const query = casesRef.where('workerId', '==', this.workerId);
        
        query.onSnapshot(snapshot => {
            console.log('Real-time update received for worker cases');
            this.loadWorkerCases().then(() => {
                this.calculateStatistics();
                this.updateDashboardUI();
            });
        }, error => {
            console.error('Real-time listener error:', error);
        });
    }

    // Navigation functions
    submitNewGrievance() {
        window.location.href = '../../worker-portal.html';
    }

    trackExistingCase() {
        window.location.href = '../../worker-portal.html#tracking';
    }

    contactSupport() {
        // Open contact modal or redirect to contact page
        this.showContactModal();
    }

    viewResources() {
        // Open resources modal or redirect to resources page
        this.showResourcesModal();
    }

    viewAllCases() {
        window.location.href = 'case-tracking-portal.html';
    }

    viewCaseDetails(caseId) {
        window.location.href = `case-tracking-portal.html?caseId=${caseId}`;
    }

    openResource(resourceType) {
        const resources = {
            guide: {
                title: 'Submission Guide',
                content: 'How to submit a grievance step by step...'
            },
            rights: {
                title: 'Worker Rights',
                content: 'Your rights and protections under the law...'
            },
            faq: {
                title: 'Frequently Asked Questions',
                content: 'Common questions and answers...'
            },
            policy: {
                title: 'Grievance Policy',
                content: 'Company grievance policy and procedures...'
            }
        };

        const resource = resources[resourceType];
        if (resource) {
            this.showResourceModal(resource.title, resource.content);
        }
    }

    showContactModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Contact Support</h3>
                    <button onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="contact-item">
                        <strong>Grievance Hotline:</strong> +855 12 345 678
                    </div>
                    <div class="contact-item">
                        <strong>Email:</strong> grievance@angkorcompliance.com
                    </div>
                    <div class="contact-item">
                        <strong>Office:</strong> HR Department, Building A
                    </div>
                    <div class="contact-item">
                        <strong>Hours:</strong> Mon-Fri: 8:00 AM - 5:00 PM
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showResourcesModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Help Resources</h3>
                    <button onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="resource-item" onclick="openResource('guide')">
                        <h4>Submission Guide</h4>
                        <p>Learn how to submit a grievance properly</p>
                    </div>
                    <div class="resource-item" onclick="openResource('rights')">
                        <h4>Worker Rights</h4>
                        <p>Understand your rights and protections</p>
                    </div>
                    <div class="resource-item" onclick="openResource('faq')">
                        <h4>FAQ</h4>
                        <p>Frequently asked questions</p>
                    </div>
                    <div class="resource-item" onclick="openResource('policy')">
                        <h4>Grievance Policy</h4>
                        <p>Company grievance policy</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showResourceModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <p>${content}</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Utility functions
    formatDate(date) {
        if (!date) return 'N/A';
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    }

    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
    }

    showSuccess(message) {
        // Show success notification
        console.log('✅', message);
    }

    showError(message) {
        // Show error notification
        console.error('❌', message);
    }
}

// Global functions for button actions
function submitNewGrievance() {
    window.workerDashboard?.submitNewGrievance();
}

function trackExistingCase() {
    window.workerDashboard?.trackExistingCase();
}

function contactSupport() {
    window.workerDashboard?.contactSupport();
}

function viewResources() {
    window.workerDashboard?.viewResources();
}

function viewAllCases() {
    window.workerDashboard?.viewAllCases();
}

function viewCaseDetails(caseId) {
    window.workerDashboard?.viewCaseDetails(caseId);
}

function openResource(resourceType) {
    window.workerDashboard?.openResource(resourceType);
}

// Initialize dashboard
let workerDashboard;
document.addEventListener('DOMContentLoaded', () => {
    workerDashboard = new WorkerDashboard();
    window.workerDashboard = workerDashboard;
    workerDashboard.init();
});
