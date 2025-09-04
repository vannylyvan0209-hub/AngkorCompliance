// Investigation Workflow System
// Manages investigation process, evidence collection, and report generation

class InvestigationWorkflow {
    constructor() {
        this.currentLanguage = 'en';
        this.investigationSteps = [];
        this.evidenceItems = [];
        this.currentCase = null;
        this.investigationProgress = 0;
        
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
        document.getElementById('investigation-date').value = new Date().toISOString().split('T')[0];
        
        // Initialize language
        this.updateLanguage();
    }

    setupEventListeners() {
        // Report form submission
        document.getElementById('report-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateReport();
        });

        // Save draft button
        document.getElementById('save-draft-btn').addEventListener('click', () => {
            this.saveDraft();
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
        // Load user-specific investigation data
        this.db.collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    if (userData.role === 'grievance_committee') {
                        this.loadInvestigationData();
                    }
                }
            })
            .catch((error) => {
                console.error('Error loading user data:', error);
            });
    }

    loadInvestigationData() {
        // Load investigation data from Firestore
        this.db.collection('investigations')
            .where('status', 'in', ['active', 'pending'])
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get()
            .then((querySnapshot) => {
                const investigations = [];
                querySnapshot.forEach((doc) => {
                    investigations.push({ id: doc.id, ...doc.data() });
                });
                this.updateInvestigationDisplay(investigations);
            })
            .catch((error) => {
                console.error('Error loading investigation data:', error);
                // Load sample data if Firebase fails
                this.loadSampleData();
            });
    }

    loadSampleData() {
        // Sample investigation steps
        this.investigationSteps = [
            {
                id: 1,
                title: 'Case Initiation',
                description: 'Review case details and assign investigator',
                status: 'completed',
                completedAt: new Date(Date.now() - 86400000 * 2)
            },
            {
                id: 2,
                title: 'Evidence Collection',
                description: 'Gather relevant documents, statements, and physical evidence',
                status: 'in-progress',
                startedAt: new Date(Date.now() - 86400000)
            },
            {
                id: 3,
                title: 'Witness Interviews',
                description: 'Conduct interviews with involved parties and witnesses',
                status: 'pending'
            },
            {
                id: 4,
                title: 'Evidence Analysis',
                description: 'Analyze collected evidence and assess credibility',
                status: 'pending'
            },
            {
                id: 5,
                title: 'Report Generation',
                description: 'Compile findings and generate investigation report',
                status: 'pending'
            }
        ];

        // Sample evidence items
        this.evidenceItems = [
            {
                id: 1,
                type: 'Document',
                title: 'Initial Complaint Form',
                description: 'Original grievance submission document',
                status: 'collected',
                collectedAt: new Date(Date.now() - 86400000 * 2),
                investigator: 'John Smith'
            },
            {
                id: 2,
                type: 'Statement',
                title: 'Witness Statement - Jane Doe',
                description: 'Written statement from key witness',
                status: 'collected',
                collectedAt: new Date(Date.now() - 86400000),
                investigator: 'John Smith'
            },
            {
                id: 3,
                type: 'Physical',
                title: 'Security Camera Footage',
                description: 'Video evidence from incident location',
                status: 'pending',
                investigator: 'John Smith'
            },
            {
                id: 4,
                type: 'Document',
                title: 'HR Policy Documents',
                description: 'Relevant company policies and procedures',
                status: 'collected',
                collectedAt: new Date(Date.now() - 86400000 * 1.5),
                investigator: 'John Smith'
            },
            {
                id: 5,
                type: 'Statement',
                title: 'Accused Party Response',
                description: 'Response statement from accused individual',
                status: 'pending',
                investigator: 'John Smith'
            }
        ];

        // Sample case data
        this.currentCase = {
            id: 'GC-2024-001',
            title: 'Workplace Harassment Complaint',
            category: 'Harassment',
            severity: 'High',
            status: 'Under Investigation',
            complainant: 'Anonymous',
            accused: 'Manager A',
            department: 'Production',
            createdAt: new Date(Date.now() - 86400000 * 3),
            assignedTo: 'John Smith',
            deadline: new Date(Date.now() + 86400000 * 7)
        };

        this.updateDisplay();
        this.calculateProgress();
    }

    updateDisplay() {
        this.updateInvestigationSteps();
        this.updateEvidenceGrid();
        this.updateTimeline();
        this.updateCaseInfo();
    }

    updateInvestigationSteps() {
        const stepsContainer = document.getElementById('investigation-steps');
        stepsContainer.innerHTML = '';

        this.investigationSteps.forEach((step) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'step-item';
            
            const statusClass = step.status === 'completed' ? 'completed' : 
                              step.status === 'in-progress' ? 'active' : 'pending';
            
            stepElement.innerHTML = `
                <div class="step-number ${statusClass}">${step.id}</div>
                <div class="step-content">
                    <h4>${step.title}</h4>
                    <p>${step.description}</p>
                    ${step.status === 'completed' && step.completedAt ? 
                        `<small>Completed: ${step.completedAt.toLocaleDateString()}</small>` : ''}
                    ${step.status === 'in-progress' && step.startedAt ? 
                        `<small>Started: ${step.startedAt.toLocaleDateString()}</small>` : ''}
                </div>
            `;
            
            stepsContainer.appendChild(stepElement);
        });
    }

    updateEvidenceGrid() {
        const evidenceContainer = document.getElementById('evidence-grid');
        evidenceContainer.innerHTML = '';

        this.evidenceItems.forEach((evidence) => {
            const evidenceCard = document.createElement('div');
            evidenceCard.className = 'evidence-card';
            
            const statusClass = `status-${evidence.status}`;
            const statusText = evidence.status.charAt(0).toUpperCase() + evidence.status.slice(1);
            
            evidenceCard.innerHTML = `
                <div class="evidence-header">
                    <i class="fas fa-${this.getEvidenceIcon(evidence.type)}"></i>
                    <h4>${evidence.title}</h4>
                    <span class="evidence-status ${statusClass}">${statusText}</span>
                </div>
                <p>${evidence.description}</p>
                <small><strong>Investigator:</strong> ${evidence.investigator}</small>
                ${evidence.collectedAt ? `<br><small><strong>Collected:</strong> ${evidence.collectedAt.toLocaleDateString()}</small>` : ''}
                <div class="evidence-actions">
                    ${evidence.status === 'pending' ? 
                        `<button class="btn btn-primary btn-sm" onclick="investigationWorkflow.collectEvidence(${evidence.id})">
                            <i class="fas fa-plus"></i> Collect
                        </button>` : ''}
                    ${evidence.status === 'collected' ? 
                        `<button class="btn btn-success btn-sm" onclick="investigationWorkflow.verifyEvidence(${evidence.id})">
                            <i class="fas fa-check"></i> Verify
                        </button>` : ''}
                    <button class="btn btn-secondary btn-sm" onclick="investigationWorkflow.viewEvidence(${evidence.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            `;
            
            evidenceContainer.appendChild(evidenceCard);
        });
    }

    updateTimeline() {
        const timelineContainer = document.getElementById('timeline-content');
        timelineContainer.innerHTML = '';

        // Create timeline from investigation steps and evidence
        const timelineEvents = [
            ...this.investigationSteps.map(step => ({
                type: 'step',
                data: step,
                date: step.completedAt || step.startedAt || new Date()
            })),
            ...this.evidenceItems.map(evidence => ({
                type: 'evidence',
                data: evidence,
                date: evidence.collectedAt || new Date()
            }))
        ].sort((a, b) => b.date - a.date);

        timelineEvents.forEach((event) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.style.cssText = `
                border-left: 3px solid #667eea;
                padding-left: 20px;
                margin-bottom: 20px;
                position: relative;
            `;
            
            const icon = event.type === 'step' ? 'fas fa-tasks' : 'fas fa-file-alt';
            const title = event.type === 'step' ? event.data.title : event.data.title;
            const description = event.type === 'step' ? event.data.description : event.data.description;
            
            timelineItem.innerHTML = `
                <div style="position: relative;">
                    <div style="position: absolute; left: -11px; top: 0; width: 19px; height: 19px; border-radius: 50%; background: #667eea;"></div>
                    <h5 style="margin: 0 0 5px 0; color: #333;">${title}</h5>
                    <p style="margin: 0 0 5px 0; color: #666;">${description}</p>
                    <small style="color: #999;">${event.date.toLocaleDateString()}</small>
                </div>
            `;
            
            timelineContainer.appendChild(timelineItem);
        });
    }

    updateCaseInfo() {
        if (this.currentCase) {
            document.getElementById('case-number').value = this.currentCase.id;
            document.getElementById('investigator-name').value = this.currentCase.assignedTo;
        }
    }

    calculateProgress() {
        const completedSteps = this.investigationSteps.filter(step => step.status === 'completed').length;
        const totalSteps = this.investigationSteps.length;
        this.investigationProgress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const progressDetails = document.getElementById('progress-details');

        progressFill.style.width = `${this.investigationProgress}%`;
        progressText.textContent = `${Math.round(this.investigationProgress)}% Complete`;
        progressDetails.textContent = `${completedSteps} of ${totalSteps} steps completed`;
    }

    getEvidenceIcon(type) {
        const iconMap = {
            'Document': 'file-alt',
            'Statement': 'comments',
            'Physical': 'camera',
            'Video': 'video',
            'Audio': 'microphone',
            'Photo': 'image'
        };
        return iconMap[type] || 'file';
    }

    collectEvidence(evidenceId) {
        const evidence = this.evidenceItems.find(e => e.id === evidenceId);
        if (evidence) {
            evidence.status = 'collected';
            evidence.collectedAt = new Date();
            this.updateDisplay();
            this.calculateProgress();
            this.showNotification('Evidence collected successfully', 'success');
        }
    }

    verifyEvidence(evidenceId) {
        const evidence = this.evidenceItems.find(e => e.id === evidenceId);
        if (evidence) {
            evidence.status = 'verified';
            this.updateDisplay();
            this.calculateProgress();
            this.showNotification('Evidence verified successfully', 'success');
        }
    }

    viewEvidence(evidenceId) {
        const evidence = this.evidenceItems.find(e => e.id === evidenceId);
        if (evidence) {
            alert(`Evidence Details:\n\nTitle: ${evidence.title}\nType: ${evidence.type}\nDescription: ${evidence.description}\nStatus: ${evidence.status}\nInvestigator: ${evidence.investigator}`);
        }
    }

    generateReport() {
        const formData = this.getFormData();
        
        if (!this.validateFormData(formData)) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Create report object
        const report = {
            ...formData,
            caseId: this.currentCase?.id,
            generatedAt: new Date(),
            status: 'draft'
        };

        // Save to Firebase if available
        if (this.db && this.auth.currentUser) {
            this.db.collection('investigation-reports').add(report)
                .then((docRef) => {
                    this.showNotification('Report generated and saved successfully', 'success');
                    this.resetForm();
                })
                .catch((error) => {
                    console.error('Error saving report:', error);
                    this.showNotification('Error saving report', 'error');
                });
        } else {
            // Local storage fallback
            const reports = JSON.parse(localStorage.getItem('investigationReports') || '[]');
            reports.push({ ...report, id: Date.now() });
            localStorage.setItem('investigationReports', JSON.stringify(reports));
            
            this.showNotification('Report generated and saved locally', 'success');
            this.resetForm();
        }
    }

    saveDraft() {
        const formData = this.getFormData();
        const draft = {
            ...formData,
            caseId: this.currentCase?.id,
            savedAt: new Date(),
            status: 'draft'
        };

        // Save draft to localStorage
        localStorage.setItem('investigationDraft', JSON.stringify(draft));
        this.showNotification('Draft saved successfully', 'success');
    }

    getFormData() {
        return {
            title: document.getElementById('report-title-input').value,
            investigationDate: document.getElementById('investigation-date').value,
            investigatorName: document.getElementById('investigator-name').value,
            caseNumber: document.getElementById('case-number').value,
            executiveSummary: document.getElementById('executive-summary').value,
            findings: document.getElementById('findings').value,
            recommendations: document.getElementById('recommendations').value,
            nextSteps: document.getElementById('next-steps').value
        };
    }

    validateFormData(data) {
        return Object.values(data).every(value => value && value.trim() !== '');
    }

    resetForm() {
        document.getElementById('report-form').reset();
        document.getElementById('investigation-date').value = new Date().toISOString().split('T')[0];
        if (this.currentCase) {
            document.getElementById('case-number').value = this.currentCase.id;
            document.getElementById('investigator-name').value = this.currentCase.assignedTo;
        }
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
                'page-title': 'Investigation Workflow',
                'page-subtitle': 'Manage investigation process, evidence collection, and report generation',
                'progress-title': 'Investigation Progress',
                'workflow-title': 'Investigation Workflow',
                'timeline-title': 'Investigation Timeline',
                'evidence-title': 'Evidence Collection',
                'report-title': 'Report Generation',
                'report-title-label': 'Report Title',
                'investigation-date-label': 'Investigation Date',
                'investigator-name-label': 'Lead Investigator',
                'case-number-label': 'Case Number',
                'executive-summary-label': 'Executive Summary',
                'findings-label': 'Key Findings',
                'recommendations-label': 'Recommendations',
                'next-steps-label': 'Next Steps',
                'generate-report-text': 'Generate Report',
                'save-draft-text': 'Save Draft',
                'lang-text': 'English'
            },
            km: {
                'page-title': 'លំហូរការងារស៊ើបអង្កេត',
                'page-subtitle': 'គ្រប់គ្រងដំណើរការស៊ើបអង្កេត ការប្រមូលភស្តុតាង និងការបង្កើតរបាយការណ៍',
                'progress-title': 'ការវឌ្ឍន៍ស៊ើបអង្កេត',
                'workflow-title': 'លំហូរការងារស៊ើបអង្កេត',
                'timeline-title': 'ពេលវេលាស៊ើបអង្កេត',
                'evidence-title': 'ការប្រមូលភស្តុតាង',
                'report-title': 'ការបង្កើតរបាយការណ៍',
                'report-title-label': 'ចំណងជើងរបាយការណ៍',
                'investigation-date-label': 'កាលបរិច្ឆេទស៊ើបអង្កេត',
                'investigator-name-label': 'អ្នកស៊ើបអង្កេតដឹកនាំ',
                'case-number-label': 'លេខករណី',
                'executive-summary-label': 'សេចក្តីសង្ខេបអនុវត្តន៍',
                'findings-label': 'ការរកឃើញសំខាន់ៗ',
                'recommendations-label': 'ការណែនាំ',
                'next-steps-label': 'ជំហានបន្ទាប់',
                'generate-report-text': 'បង្កើតរបាយការណ៍',
                'save-draft-text': 'រក្សាទុកព្រោះ',
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
let investigationWorkflow;

document.addEventListener('DOMContentLoaded', () => {
    investigationWorkflow = new InvestigationWorkflow();
});

// Global functions for HTML onclick handlers
window.investigationWorkflow = null;

window.toggleLanguage = function() {
    if (investigationWorkflow) {
        investigationWorkflow.toggleLanguage();
    }
};

// Make functions globally accessible
window.collectEvidence = function(id) {
    if (investigationWorkflow) {
        investigationWorkflow.collectEvidence(id);
    }
};

window.verifyEvidence = function(id) {
    if (investigationWorkflow) {
        investigationWorkflow.verifyEvidence(id);
    }
};

window.viewEvidence = function(id) {
    if (investigationWorkflow) {
        investigationWorkflow.viewEvidence(id);
    }
};

