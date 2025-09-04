import { initializeFirebase } from '../../firebase-config.js';

class CaseTrackingPortal {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.workerId = null;
        this.currentCase = null;
        this.cases = [];
    }

    async init() {
        try {
            console.log('🚀 Initializing Case Tracking Portal...');
            
            // Initialize Firebase
            await initializeFirebase();
            this.db = window.Firebase?.db;
            this.auth = window.Firebase?.auth;
            
            // Check authentication
            await this.checkAuthentication();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Check for case ID in URL
            this.checkUrlParams();
            
            console.log('✅ Case Tracking Portal initialized');
            
        } catch (error) {
            console.error('❌ Case Tracking Portal initialization failed:', error);
            this.showError('Failed to initialize tracking portal');
        }
    }

    async checkAuthentication() {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                // For worker portal, we might allow anonymous access
                console.log('No authenticated user, checking for anonymous session...');
                this.workerId = this.getWorkerIdFromSession();
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

    setupEventListeners() {
        // Tracking form submission
        const trackingForm = document.getElementById('trackingForm');
        trackingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.trackCase();
        });

        // Case ID input change
        const caseIdInput = document.getElementById('caseId');
        caseIdInput.addEventListener('input', () => {
            this.searchCases();
        });

        // Phone number input change
        const phoneInput = document.getElementById('phoneNumber');
        phoneInput.addEventListener('input', () => {
            this.searchCases();
        });
    }

    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const caseId = urlParams.get('caseId');
        
        if (caseId) {
            document.getElementById('caseId').value = caseId;
            this.trackCase();
        }
    }

    async trackCase() {
        try {
            const caseId = document.getElementById('caseId').value.trim();
            const phoneNumber = document.getElementById('phoneNumber').value.trim();

            if (!caseId || !phoneNumber) {
                this.showError('Please enter both case ID and phone number');
                return;
            }

            this.showLoading();

            // Search for the case
            const caseData = await this.searchCaseById(caseId, phoneNumber);
            
            if (caseData) {
                this.currentCase = caseData;
                this.displayCaseDetails(caseData);
                this.loadCaseTimeline(caseData.id);
                this.loadCaseCommunications(caseData.id);
            } else {
                this.showError('Case not found. Please check your case ID and phone number.');
                this.hideLoading();
            }

        } catch (error) {
            console.error('Case tracking failed:', error);
            this.showError('Failed to track case. Please try again.');
            this.hideLoading();
        }
    }

    async searchCaseById(caseId, phoneNumber) {
        try {
            // Query the grievances collection
            const casesRef = this.db.collection('grievances');
            const query = casesRef.where('caseId', '==', caseId)
                                .where('contactPhone', '==', phoneNumber);
            
            const snapshot = await query.get();
            
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const caseData = doc.data();
                return {
                    id: doc.id,
                    ...caseData,
                    createdAt: caseData.createdAt?.toDate(),
                    updatedAt: caseData.updatedAt?.toDate(),
                    resolvedAt: caseData.resolvedAt?.toDate()
                };
            }
            
            return null;
            
        } catch (error) {
            console.error('Search case failed:', error);
            throw error;
        }
    }

    async searchCases() {
        try {
            const caseId = document.getElementById('caseId').value.trim();
            const phoneNumber = document.getElementById('phoneNumber').value.trim();

            if (!caseId && !phoneNumber) {
                this.updateCasesList([]);
                return;
            }

            // Build query based on available fields
            const casesRef = this.db.collection('grievances');
            let query = casesRef;

            if (caseId && phoneNumber) {
                query = query.where('caseId', '==', caseId)
                           .where('contactPhone', '==', phoneNumber);
            } else if (caseId) {
                query = query.where('caseId', '==', caseId);
            } else if (phoneNumber) {
                query = query.where('contactPhone', '==', phoneNumber);
            }

            const snapshot = await query.limit(10).get();
            const cases = [];
            
            snapshot.forEach(doc => {
                const caseData = doc.data();
                cases.push({
                    id: doc.id,
                    ...caseData,
                    createdAt: caseData.createdAt?.toDate(),
                    updatedAt: caseData.updatedAt?.toDate()
                });
            });

            this.updateCasesList(cases);

        } catch (error) {
            console.error('Search cases failed:', error);
        }
    }

    updateCasesList(cases) {
        const casesList = document.getElementById('casesList');
        
        if (cases.length === 0) {
            casesList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="file-text"></i>
                    <h3>No cases found</h3>
                    <p>Enter your case ID and phone number to track your case</p>
                </div>
            `;
            return;
        }

        const casesHTML = cases.map(caseItem => `
            <div class="case-item" onclick="selectCase('${caseItem.id}')">
                <div class="case-info">
                    <div class="case-id">Case #${caseItem.caseId || caseItem.id.slice(-8)}</div>
                    <div class="case-category">${this.capitalizeFirst(caseItem.category)}</div>
                    <div class="case-date">Submitted: ${this.formatDate(caseItem.createdAt)}</div>
                </div>
                <div class="case-status status-${caseItem.status}">
                    ${this.capitalizeFirst(caseItem.status)}
                </div>
            </div>
        `).join('');

        casesList.innerHTML = casesHTML;
    }

    displayCaseDetails(caseData) {
        // Show case details card
        document.getElementById('welcomeCard').style.display = 'none';
        document.getElementById('caseDetailsCard').style.display = 'block';

        // Update case overview
        this.updateCaseOverview(caseData);

        this.hideLoading();
    }

    updateCaseOverview(caseData) {
        const overview = document.getElementById('caseOverview');
        
        const daysSinceSubmission = caseData.createdAt 
            ? Math.floor((new Date() - caseData.createdAt) / (1000 * 60 * 60 * 24))
            : 0;

        const resolutionTime = caseData.resolvedAt && caseData.createdAt
            ? Math.floor((caseData.resolvedAt - caseData.createdAt) / (1000 * 60 * 60 * 24))
            : null;

        overview.innerHTML = `
            <div class="overview-item">
                <div class="overview-label">Case ID</div>
                <div class="overview-value">${caseData.caseId || caseData.id.slice(-8)}</div>
            </div>
            <div class="overview-item">
                <div class="overview-label">Status</div>
                <div class="overview-value">${this.capitalizeFirst(caseData.status)}</div>
            </div>
            <div class="overview-item">
                <div class="overview-label">Category</div>
                <div class="overview-value">${this.capitalizeFirst(caseData.category)}</div>
            </div>
            <div class="overview-item">
                <div class="overview-label">Submitted</div>
                <div class="overview-value">${this.formatDate(caseData.createdAt)}</div>
            </div>
            <div class="overview-item">
                <div class="overview-label">Days Since Submission</div>
                <div class="overview-value">${daysSinceSubmission} days</div>
            </div>
            ${resolutionTime ? `
                <div class="overview-item">
                    <div class="overview-label">Resolution Time</div>
                    <div class="overview-value">${resolutionTime} days</div>
                </div>
            ` : ''}
        `;
    }

    async loadCaseTimeline(caseId) {
        try {
            const timelineRef = this.db.collection('grievances').doc(caseId).collection('timeline');
            const snapshot = await timelineRef.orderBy('timestamp', 'asc').get();
            
            const timeline = [];
            snapshot.forEach(doc => {
                const timelineData = doc.data();
                timeline.push({
                    id: doc.id,
                    ...timelineData,
                    timestamp: timelineData.timestamp?.toDate()
                });
            });

            this.updateTimeline(timeline);

        } catch (error) {
            console.error('Failed to load timeline:', error);
            this.updateTimeline([]);
        }
    }

    updateTimeline(timeline) {
        const timelineContainer = document.getElementById('caseTimeline');
        
        if (timeline.length === 0) {
            timelineContainer.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="clock"></i>
                    <h3>No timeline events</h3>
                    <p>Timeline events will appear here as your case progresses</p>
                </div>
            `;
            return;
        }

        const timelineHTML = timeline.map(event => `
            <div class="timeline-item">
                <div class="timeline-icon">
                    <i data-lucide="${this.getTimelineIcon(event.type)}"></i>
                </div>
                <div class="timeline-content">
                    <div class="timeline-title">${event.title}</div>
                    <div class="timeline-description">${event.description}</div>
                    <div class="timeline-date">${this.formatDate(event.timestamp)}</div>
                </div>
            </div>
        `).join('');

        timelineContainer.innerHTML = timelineHTML;
    }

    async loadCaseCommunications(caseId) {
        try {
            const communicationsRef = this.db.collection('grievances').doc(caseId).collection('communications');
            const snapshot = await communicationsRef.orderBy('timestamp', 'desc').get();
            
            const communications = [];
            snapshot.forEach(doc => {
                const commData = doc.data();
                communications.push({
                    id: doc.id,
                    ...commData,
                    timestamp: commData.timestamp?.toDate()
                });
            });

            this.updateCommunications(communications);

        } catch (error) {
            console.error('Failed to load communications:', error);
            this.updateCommunications([]);
        }
    }

    updateCommunications(communications) {
        const communicationsContainer = document.getElementById('caseCommunications');
        
        if (communications.length === 0) {
            communicationsContainer.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="message-circle"></i>
                    <h3>No communications</h3>
                    <p>Communication updates will appear here</p>
                </div>
            `;
            return;
        }

        const communicationsHTML = communications.map(comm => `
            <div class="communication-item">
                <div class="communication-header">
                    <div class="communication-sender">${comm.sender}</div>
                    <div class="communication-date">${this.formatDate(comm.timestamp)}</div>
                </div>
                <div class="communication-content">${comm.message}</div>
            </div>
        `).join('');

        communicationsContainer.innerHTML = communicationsHTML;
    }

    getTimelineIcon(type) {
        const icons = {
            'submitted': 'file-text',
            'assigned': 'user-check',
            'investigating': 'search',
            'resolved': 'check-circle',
            'closed': 'archive',
            'note': 'message-square',
            'update': 'refresh-cw'
        };
        return icons[type] || 'circle';
    }

    selectCase(caseId) {
        // Find the case in the list and display it
        const caseItem = this.cases.find(c => c.id === caseId);
        if (caseItem) {
            this.currentCase = caseItem;
            this.displayCaseDetails(caseItem);
            this.loadCaseTimeline(caseId);
            this.loadCaseCommunications(caseId);
        }
    }

    showLoading() {
        document.getElementById('welcomeCard').style.display = 'none';
        document.getElementById('caseDetailsCard').style.display = 'none';
        document.getElementById('loadingCard').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loadingCard').style.display = 'none';
    }

    // Navigation functions
    submitNewGrievance() {
        window.location.href = '../../worker-portal.html';
    }

    goToDashboard() {
        window.location.href = 'worker-dashboard.html';
    }

    // Utility functions
    formatDate(date) {
        if (!date) return 'N/A';
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
        alert(message); // Simple alert for now
    }
}

// Global functions for button actions
function selectCase(caseId) {
    window.caseTrackingPortal?.selectCase(caseId);
}

function submitNewGrievance() {
    window.caseTrackingPortal?.submitNewGrievance();
}

function goToDashboard() {
    window.caseTrackingPortal?.goToDashboard();
}

// Initialize portal
let caseTrackingPortal;
document.addEventListener('DOMContentLoaded', () => {
    caseTrackingPortal = new CaseTrackingPortal();
    window.caseTrackingPortal = caseTrackingPortal;
    caseTrackingPortal.init();
});
