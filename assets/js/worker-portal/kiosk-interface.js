// Kiosk Interface System
class KioskInterfaceSystem {
    constructor() {
        this.currentLanguage = 'en';
        this.currentCase = null;
        this.qrCodeData = null;
        this.translations = {
            en: {
                systemOnline: 'System Online',
                welcome: 'Welcome to Angkor Compliance Platform - Touch to get started',
                submitCase: 'Submit New Case',
                trackCase: 'Track My Case',
                uploadDocuments: 'Upload Documents',
                updateCase: 'Update Case',
                contactInfo: 'Contact Information',
                faq: 'Frequently Asked Questions',
                emergency: 'Emergency Assistance',
                needHelp: 'Need Help?',
                quickAccess: 'Quick Access',
                scanQR: 'Scan this QR code with your phone',
                accessInfo: 'Access your case information and submit updates directly from your mobile device'
            },
            km: {
                systemOnline: 'ប្រព័ន្ធអនឡាញ',
                welcome: 'សូមស្វាគមន៍មកកាន់វេទិកាអនុលោមតាមអង្គការ Angkor - ចុចដើម្បីចាប់ផ្តើម',
                submitCase: 'ដាក់ស្នើករណីថ្មី',
                trackCase: 'តាមដានករណីរបស់ខ្ញុំ',
                uploadDocuments: 'ផ្ទុកឡើងឯកសារ',
                updateCase: 'ធ្វើបច្ចុប្បន្នភាពករណី',
                contactInfo: 'ព័ត៌មានទំនាក់ទំនង',
                faq: 'សំណួរដែលសួរញឹកញាប់',
                emergency: 'ជំនួយអាសន្ន',
                needHelp: 'ត្រូវការជំនួយ?',
                quickAccess: 'ការចូលប្រើរហ័ស',
                scanQR: 'ស្កេន QR code នេះជាមួយទូរស័ព្ទរបស់អ្នក',
                accessInfo: 'ចូលប្រើព័ត៌មានករណីរបស់អ្នក និងដាក់ស្នើការធ្វើបច្ចុប្បន្នភាពដោយផ្ទាល់ពីឧបករណ៍ចល័តរបស់អ្នក'
            }
        };
        
        this.initializeSystem();
    }

    async initializeSystem() {
        try {
            // Initialize Firebase
            await this.initializeFirebase();
            
            // Initialize UI components
            this.initializeUI();
            
            // Generate QR code
            await this.generateQRCode();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Update language
            this.updateLanguage(this.currentLanguage);
            
            console.log('Kiosk Interface System initialized successfully');
        } catch (error) {
            console.error('Error initializing Kiosk Interface System:', error);
            this.showNotification('Error initializing system', 'error');
        }
    }

    async initializeFirebase() {
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase not loaded');
        }
        
        this.db = firebase.firestore();
        this.storage = firebase.storage();
    }

    initializeUI() {
        // Initialize language selector
        this.initializeLanguageSelector();
        
        // Initialize form handlers
        this.initializeFormHandlers();
        
        // Initialize status indicator
        this.updateStatusIndicator();
    }

    initializeLanguageSelector() {
        const languageButtons = document.querySelectorAll('.language-btn');
        languageButtons.forEach(button => {
            button.addEventListener('click', () => {
                const lang = button.dataset.lang;
                this.changeLanguage(lang);
            });
        });
    }

    initializeFormHandlers() {
        // Case submission form
        const caseSubmissionForm = document.getElementById('caseSubmissionForm');
        if (caseSubmissionForm) {
            caseSubmissionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitCase();
            });
        }
        
        // Case tracking form
        const caseTrackingForm = document.getElementById('caseTrackingForm');
        if (caseTrackingForm) {
            caseTrackingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.trackCase();
            });
        }
        
        // Emergency form
        const emergencyForm = document.getElementById('emergencyForm');
        if (emergencyForm) {
            emergencyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitEmergency();
            });
        }
        
        // Help form
        const helpForm = document.getElementById('helpForm');
        if (helpForm) {
            helpForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitHelpRequest();
            });
        }
    }

    async generateQRCode() {
        try {
            const qrCodeDisplay = document.getElementById('qrCodeDisplay');
            if (!qrCodeDisplay) return;
            
            // Generate QR code data
            const qrData = {
                type: 'worker_portal',
                url: window.location.origin + '/pages/worker-portal/mobile-interface.html',
                timestamp: new Date().toISOString(),
                kioskId: 'kiosk_' + Date.now()
            };
            
            this.qrCodeData = qrData;
            
            // Generate QR code
            const qrCode = await QRCode.toCanvas(JSON.stringify(qrData), {
                width: 200,
                height: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            
            qrCodeDisplay.innerHTML = '';
            qrCodeDisplay.appendChild(qrCode);
            
        } catch (error) {
            console.error('Error generating QR code:', error);
            const qrCodeDisplay = document.getElementById('qrCodeDisplay');
            if (qrCodeDisplay) {
                qrCodeDisplay.innerHTML = '<p>QR Code generation failed</p>';
            }
        }
    }

    changeLanguage(lang) {
        this.currentLanguage = lang;
        
        // Update active button
        document.querySelectorAll('.language-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-lang="${lang}"]`).classList.add('active');
        
        // Update translations
        this.updateLanguage(lang);
    }

    updateLanguage(lang) {
        const translations = this.translations[lang];
        if (!translations) return;
        
        // Update header text
        const statusText = document.getElementById('statusText');
        if (statusText) statusText.textContent = translations.systemOnline;
        
        const welcomeText = document.querySelector('.kiosk-header p');
        if (welcomeText) welcomeText.textContent = translations.welcome;
        
        // Update QR section
        const qrInstructions = document.querySelector('.qr-instructions');
        if (qrInstructions) {
            qrInstructions.innerHTML = `
                <p><strong>${translations.scanQR}</strong></p>
                <p>${translations.accessInfo}</p>
            `;
        }
        
        // Update button texts
        const buttons = document.querySelectorAll('.kiosk-button span');
        if (buttons.length >= 6) {
            buttons[0].textContent = translations.submitCase;
            buttons[1].textContent = translations.trackCase;
            buttons[2].textContent = translations.uploadDocuments;
            buttons[3].textContent = translations.updateCase;
            buttons[4].textContent = translations.contactInfo;
            buttons[5].textContent = translations.faq;
        }
    }

    updateStatusIndicator() {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.getElementById('statusText');
        
        if (statusDot && statusText) {
            statusDot.style.background = '#25D366';
            statusText.textContent = this.translations[this.currentLanguage].systemOnline;
        }
    }

    setupEventListeners() {
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
        
        // Close modal with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    // Modal Management
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

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Action Handlers
    openCaseSubmission() {
        this.openModal('caseSubmissionModal');
    }

    openCaseTracking() {
        this.openModal('caseTrackingModal');
    }

    openDocumentUpload() {
        this.showNotification('Document upload feature coming soon', 'info');
    }

    openCaseUpdate() {
        this.showNotification('Case update feature coming soon', 'info');
    }

    openContactInfo() {
        this.showContactInfo();
    }

    openFaq() {
        this.showFAQ();
    }

    openEmergencyForm() {
        this.openModal('emergencyModal');
    }

    openHelpForm() {
        this.openModal('helpModal');
    }

    // Form Submission Handlers
    async submitCase() {
        try {
            const formData = {
                workerName: document.getElementById('workerName').value,
                workerPhone: document.getElementById('workerPhone').value,
                workerEmail: document.getElementById('workerEmail').value,
                caseType: document.getElementById('caseType').value,
                caseDescription: document.getElementById('caseDescription').value,
                casePriority: document.getElementById('casePriority').value,
                submittedAt: new Date(),
                status: 'pending',
                kioskId: this.qrCodeData?.kioskId || 'unknown'
            };
            
            // Validate required fields
            if (!formData.workerName || !formData.workerPhone || !formData.caseType || !formData.caseDescription) {
                this.showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Save to Firebase
            const caseRef = await this.db.collection('workerCases').add(formData);
            
            // Generate case number
            const caseNumber = `WC${Date.now()}`;
            await this.db.collection('workerCases').doc(caseRef.id).update({
                caseNumber: caseNumber
            });
            
            // Show success message
            this.showSuccessMessage('caseSubmissionModal', `Case submitted successfully! Your case number is: ${caseNumber}`);
            
            // Reset form
            document.getElementById('caseSubmissionForm').reset();
            
            console.log('Case submitted:', caseRef.id);
        } catch (error) {
            console.error('Error submitting case:', error);
            this.showNotification('Error submitting case', 'error');
        }
    }

    async trackCase() {
        try {
            const caseNumber = document.getElementById('trackingNumber').value;
            const phoneNumber = document.getElementById('trackingPhone').value;
            
            if (!caseNumber || !phoneNumber) {
                this.showNotification('Please enter both case number and phone number', 'error');
                return;
            }
            
            // Query Firebase for case
            const caseSnapshot = await this.db.collection('workerCases')
                .where('caseNumber', '==', caseNumber)
                .where('workerPhone', '==', phoneNumber)
                .get();
            
            const trackingResult = document.getElementById('trackingResult');
            
            if (caseSnapshot.empty) {
                trackingResult.innerHTML = '<div class="error-message">Case not found. Please check your case number and phone number.</div>';
                return;
            }
            
            const caseData = caseSnapshot.docs[0].data();
            
            // Display case information
            trackingResult.innerHTML = `
                <div class="success-message">
                    <h3>Case Found</h3>
                    <p><strong>Case Number:</strong> ${caseData.caseNumber}</p>
                    <p><strong>Status:</strong> ${caseData.status}</p>
                    <p><strong>Type:</strong> ${caseData.caseType}</p>
                    <p><strong>Submitted:</strong> ${this.formatDate(caseData.submittedAt)}</p>
                    <p><strong>Description:</strong> ${caseData.caseDescription}</p>
                </div>
            `;
            
        } catch (error) {
            console.error('Error tracking case:', error);
            this.showNotification('Error tracking case', 'error');
        }
    }

    async submitEmergency() {
        try {
            const formData = {
                workerName: document.getElementById('emergencyName').value,
                workerPhone: document.getElementById('emergencyPhone').value,
                emergencyType: document.getElementById('emergencyType').value,
                emergencyDescription: document.getElementById('emergencyDescription').value,
                emergencyLocation: document.getElementById('emergencyLocation').value,
                submittedAt: new Date(),
                status: 'emergency',
                priority: 'critical',
                kioskId: this.qrCodeData?.kioskId || 'unknown'
            };
            
            // Validate required fields
            if (!formData.workerName || !formData.workerPhone || !formData.emergencyType || !formData.emergencyDescription) {
                this.showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Save to Firebase
            await this.db.collection('emergencyReports').add(formData);
            
            // Show success message
            this.showSuccessMessage('emergencyModal', 'Emergency report submitted successfully! Help is on the way.');
            
            // Reset form
            document.getElementById('emergencyForm').reset();
            
            console.log('Emergency report submitted');
        } catch (error) {
            console.error('Error submitting emergency report:', error);
            this.showNotification('Error submitting emergency report', 'error');
        }
    }

    async submitHelpRequest() {
        try {
            const formData = {
                workerName: document.getElementById('helpName').value,
                workerPhone: document.getElementById('helpPhone').value,
                helpType: document.getElementById('helpType').value,
                helpDescription: document.getElementById('helpDescription').value,
                submittedAt: new Date(),
                status: 'pending',
                kioskId: this.qrCodeData?.kioskId || 'unknown'
            };
            
            // Validate required fields
            if (!formData.workerName || !formData.workerPhone || !formData.helpType || !formData.helpDescription) {
                this.showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Save to Firebase
            await this.db.collection('helpRequests').add(formData);
            
            // Show success message
            this.showSuccessMessage('helpModal', 'Help request submitted successfully! We will contact you soon.');
            
            // Reset form
            document.getElementById('helpForm').reset();
            
            console.log('Help request submitted');
        } catch (error) {
            console.error('Error submitting help request:', error);
            this.showNotification('Error submitting help request', 'error');
        }
    }

    showContactInfo() {
        const contactInfo = `
            <div class="modal-content">
                <span class="close" onclick="kioskInterface.closeModal('contactInfoModal')">&times;</span>
                <h2><i class="fas fa-address-book"></i> Contact Information</h2>
                <div style="font-size: 18px; line-height: 1.8;">
                    <p><strong>Main Office:</strong></p>
                    <p>Angkor Compliance Platform</p>
                    <p>Phnom Penh, Cambodia</p>
                    <p><strong>Phone:</strong> +855 23 123 456</p>
                    <p><strong>Email:</strong> info@angkorcompliance.com</p>
                    <br>
                    <p><strong>Emergency Hotline:</strong></p>
                    <p>+855 23 999 999</p>
                    <br>
                    <p><strong>Working Hours:</strong></p>
                    <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                    <p>Saturday: 8:00 AM - 12:00 PM</p>
                </div>
            </div>
        `;
        
        this.showCustomModal('contactInfoModal', contactInfo);
    }

    showFAQ() {
        const faqContent = `
            <div class="modal-content">
                <span class="close" onclick="kioskInterface.closeModal('faqModal')">&times;</span>
                <h2><i class="fas fa-question"></i> Frequently Asked Questions</h2>
                <div style="font-size: 18px; line-height: 1.8;">
                    <h3>Q: How do I submit a case?</h3>
                    <p>A: Click on "Submit New Case" and fill out the form with your details and issue description.</p>
                    
                    <h3>Q: How can I track my case?</h3>
                    <p>A: Use "Track My Case" and enter your case number and phone number to check the status.</p>
                    
                    <h3>Q: What if I have an emergency?</h3>
                    <p>A: Use the "Emergency Assistance" button for urgent situations that require immediate attention.</p>
                    
                    <h3>Q: How long does it take to process a case?</h3>
                    <p>A: Typical processing time is 3-5 business days, but urgent cases are handled immediately.</p>
                    
                    <h3>Q: Can I update my case information?</h3>
                    <p>A: Yes, use "Update Case" to provide additional information or changes to your case.</p>
                </div>
            </div>
        `;
        
        this.showCustomModal('faqModal', faqContent);
    }

    showCustomModal(modalId, content) {
        // Create modal if it doesn't exist
        let modal = document.getElementById(modalId);
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = content;
        modal.style.display = 'block';
    }

    showSuccessMessage(modalId, message) {
        const modal = document.getElementById(modalId);
        if (modal) {
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.innerHTML = message;
            
            const form = modal.querySelector('form');
            if (form) {
                form.appendChild(successDiv);
            }
            
            // Auto close after 3 seconds
            setTimeout(() => {
                this.closeModal(modalId);
            }, 3000);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : '#d1ecf1'};
            color: ${type === 'error' ? '#721c24' : type === 'success' ? '#155724' : '#0c5460'};
            padding: 15px 20px;
            border-radius: 10px;
            font-size: 18px;
            z-index: 10000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span style="margin-left: 10px;">${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    formatDate(timestamp) {
        if (!timestamp) return 'Unknown';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
}

// Initialize the system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.kioskInterface = new KioskInterfaceSystem();
});

// Mock data for development
const mockCases = [
    {
        caseNumber: 'WC1703123456',
        workerName: 'Sok Dara',
        workerPhone: '+855123456789',
        caseType: 'harassment',
        caseDescription: 'Experiencing verbal harassment from supervisor',
        status: 'in_progress',
        submittedAt: new Date('2024-01-15T10:30:00')
    },
    {
        caseNumber: 'WC1703123457',
        workerName: 'Chan Sopheak',
        workerPhone: '+855987654321',
        caseType: 'wage',
        caseDescription: 'Unpaid overtime hours for the past month',
        status: 'pending',
        submittedAt: new Date('2024-01-14T15:45:00')
    }
];

const mockEmergencyReports = [
    {
        workerName: 'Kim Srey',
        workerPhone: '+855555555555',
        emergencyType: 'safety',
        emergencyDescription: 'Chemical spill in production area',
        emergencyLocation: 'Factory Floor A',
        status: 'emergency',
        submittedAt: new Date('2024-01-15T09:15:00')
    }
];

const mockHelpRequests = [
    {
        workerName: 'Meas Vuthy',
        workerPhone: '+855777777777',
        helpType: 'technical',
        helpDescription: 'Cannot access case tracking system',
        status: 'pending',
        submittedAt: new Date('2024-01-15T11:20:00')
    }
];
