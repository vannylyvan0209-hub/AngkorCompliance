// Worker App System
// Provides safe, anonymous access to grievance reporting and support
// Supports multiple access channels: QR/Link, kiosk, hotline, WhatsApp/Telegram, in-person

class WorkerApp {
    constructor() {
        this.currentLanguage = 'en';
        this.currentUser = null;
        this.accessChannels = [];
        this.emergencyContacts = [];
        this.safetyResources = [];
        
        this.initializeSystem();
        this.setupEventListeners();
        this.loadAppData();
    }

    initializeSystem() {
        // Initialize Firebase
        if (typeof firebase !== 'undefined') {
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            this.setupFirebaseListeners();
        }

        // Initialize language
        this.updateLanguage();
        
        // Check if running on mobile device
        this.isMobile = this.checkMobileDevice();
        
        // Initialize QR code if available
        this.initializeQRCode();
    }

    setupEventListeners() {
        // Language toggle
        document.querySelector('.language-btn').addEventListener('click', () => {
            this.toggleLanguage();
        });

        // Emergency contact buttons
        document.querySelectorAll('.emergency-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleEmergencyCall(btn.textContent.trim());
            });
        });

        // Hotline button
        document.querySelector('.hotline-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleHotlineCall();
        });

        // WhatsApp button
        document.querySelector('.whatsapp-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleWhatsAppChat();
        });

        // Kiosk button
        document.querySelector('.kiosk-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.enterKioskMode();
        });

        // Quick action items
        document.querySelectorAll('.action-item').forEach(item => {
            item.addEventListener('click', () => {
                const actionType = item.querySelector('.action-title').textContent.toLowerCase();
                this.handleQuickAction(actionType);
            });
        });

        // Channel cards
        document.querySelectorAll('.channel-card').forEach(card => {
            card.addEventListener('click', () => {
                const channelType = card.querySelector('.channel-title').textContent.toLowerCase();
                this.handleChannelAccess(channelType);
            });
        });
    }

    setupFirebaseListeners() {
        // Listen for authentication state changes
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.loadUserData(user);
            } else {
                // Anonymous access is allowed for workers
                this.setupAnonymousAccess();
            }
        });
    }

    setupAnonymousAccess() {
        // Workers can access the app without authentication
        // This ensures anonymity and easy access
        console.log('Setting up anonymous access for worker app');
    }

    loadUserData(user) {
        // Load user-specific data if authenticated
        this.db.collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    if (userData.role === 'worker') {
                        this.loadWorkerData(userData);
                    }
                }
            })
            .catch((error) => {
                console.error('Error loading user data:', error);
            });
    }

    loadWorkerData(userData) {
        // Load worker-specific data
        this.currentUser = { ...user, ...userData };
        this.updateWorkerInterface();
    }

    loadAppData() {
        // Load app configuration and resources
        this.loadEmergencyContacts();
        this.loadSafetyResources();
        this.loadAccessChannels();
        this.loadSupportInformation();
    }

    loadEmergencyContacts() {
        this.emergencyContacts = [
            {
                id: 'emergency-1',
                name: 'Emergency Hotline',
                number: '+855 012 345 678',
                description: '24/7 emergency assistance',
                priority: 'high'
            },
            {
                id: 'emergency-2',
                name: 'Safety Hotline',
                number: '+855 098 765 432',
                description: 'Safety incidents and hazards',
                priority: 'high'
            },
            {
                id: 'emergency-3',
                name: 'HR Emergency',
                number: '+855 011 223 344',
                description: 'HR-related emergencies',
                priority: 'medium'
            }
        ];
    }

    loadSafetyResources() {
        this.safetyResources = [
            {
                id: 'safety-1',
                title: 'Safety Guidelines',
                description: 'Workplace safety guidelines and procedures',
                url: '../assets/documents/safety-guidelines.pdf',
                category: 'safety'
            },
            {
                id: 'safety-2',
                title: 'Emergency Procedures',
                description: 'What to do in case of emergency',
                url: '../assets/documents/emergency-procedures.pdf',
                category: 'emergency'
            },
            {
                id: 'safety-3',
                title: 'Rights & Protections',
                description: 'Your legal rights and protections',
                url: '../assets/documents/worker-rights.pdf',
                category: 'rights'
            }
        ];
    }

    loadAccessChannels() {
        this.accessChannels = [
            {
                id: 'channel-1',
                name: 'Web App',
                description: 'Access via web browser',
                icon: 'fas fa-globe',
                url: window.location.href,
                type: 'web'
            },
            {
                id: 'channel-2',
                name: 'Mobile App',
                description: 'Download mobile app',
                icon: 'fas fa-mobile-alt',
                url: '#',
                type: 'mobile'
            },
            {
                id: 'channel-3',
                name: 'QR Code',
                description: 'Scan QR code for quick access',
                icon: 'fas fa-qrcode',
                url: '#',
                type: 'qr'
            },
            {
                id: 'channel-4',
                name: 'Kiosk',
                description: 'Factory kiosk access',
                icon: 'fas fa-desktop',
                url: 'kiosk-interface.html',
                type: 'kiosk'
            },
            {
                id: 'channel-5',
                name: 'WhatsApp',
                description: 'Chat support via WhatsApp',
                icon: 'fab fa-whatsapp',
                url: 'https://wa.me/85512345678',
                type: 'whatsapp'
            },
            {
                id: 'channel-6',
                name: 'Hotline',
                description: 'Phone support',
                icon: 'fas fa-phone',
                url: 'tel:+855098765432',
                type: 'phone'
            }
        ];
    }

    loadSupportInformation() {
        // Load support information and FAQs
        this.supportInfo = {
            email: 'worker-support@angkorcompliance.com',
            hours: '24/7',
            languages: ['English', 'Khmer', 'Thai', 'Vietnamese'],
            responseTime: 'Within 24 hours',
            confidentiality: '100% anonymous and confidential'
        };
    }

    initializeQRCode() {
        // Generate QR code for the current app URL
        const qrImage = document.getElementById('qr-image');
        if (qrImage) {
            // In a real implementation, you would generate a QR code
            // For now, we'll use a placeholder
            qrImage.src = '../assets/images/qr-code-placeholder.png';
            qrImage.alt = 'Worker App QR Code';
        }
    }

    checkMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    updateWorkerInterface() {
        // Update interface based on worker data
        if (this.currentUser && this.currentUser.factoryId) {
            // Show factory-specific information
            this.loadFactoryInfo(this.currentUser.factoryId);
        }
    }

    loadFactoryInfo(factoryId) {
        // Load factory-specific information
        this.db.collection('factories').doc(factoryId).get()
            .then((doc) => {
                if (doc.exists) {
                    const factoryData = doc.data();
                    this.updateFactoryInterface(factoryData);
                }
            })
            .catch((error) => {
                console.error('Error loading factory data:', error);
            });
    }

    updateFactoryInterface(factoryData) {
        // Update interface with factory-specific information
        // This could include factory-specific emergency contacts, safety procedures, etc.
        console.log('Factory data loaded:', factoryData);
    }

    handleEmergencyCall(contactInfo) {
        // Handle emergency contact calls
        const contact = this.emergencyContacts.find(c => 
            c.name.includes(contactInfo) || c.number.includes(contactInfo)
        );
        
        if (contact) {
            this.showNotification(`Calling ${contact.name}: ${contact.number}`, 'info');
            // In a real implementation, this would initiate a phone call
            window.location.href = `tel:${contact.number}`;
        } else {
            this.showNotification('Emergency contact not found', 'error');
        }
    }

    handleHotlineCall() {
        // Handle hotline calls
        this.showNotification('Initiating hotline call...', 'info');
        // In a real implementation, this would initiate a phone call
        window.location.href = 'tel:+855098765432';
    }

    handleWhatsAppChat() {
        // Handle WhatsApp chat initiation
        this.showNotification('Opening WhatsApp chat...', 'info');
        // WhatsApp link is already configured in the HTML
    }

    enterKioskMode() {
        // Enter kiosk mode for factory kiosks
        this.showNotification('Entering kiosk mode...', 'info');
        window.location.href = 'kiosk-interface.html';
    }

    handleQuickAction(actionType) {
        // Handle quick action selections
        switch (actionType) {
            case 'safety report':
                this.openSafetyReport();
                break;
            case 'wage issue':
                this.openWageIssue();
                break;
            case 'harassment':
                this.openHarassmentReport();
                break;
            case 'working conditions':
                this.openWorkingConditions();
                break;
            default:
                this.showNotification(`Opening ${actionType} form...`, 'info');
        }
    }

    handleChannelAccess(channelType) {
        // Handle different channel access methods
        switch (channelType) {
            case 'submit grievance':
                this.openGrievanceForm();
                break;
            case 'track case':
                this.openCaseTracking();
                break;
            case 'get support':
                this.openSupport();
                break;
            default:
                this.showNotification(`Accessing ${channelType}...`, 'info');
        }
    }

    openGrievanceForm() {
        // Open grievance submission form
        this.showNotification('Opening grievance form...', 'info');
        window.location.href = 'grievance-form.html';
    }

    openCaseTracking() {
        // Open case tracking interface
        this.showNotification('Opening case tracking...', 'info');
        window.location.href = 'case-tracking.html';
    }

    openSupport() {
        // Open support interface
        this.showNotification('Opening support...', 'info');
        window.location.href = 'support.html';
    }

    openSafetyReport() {
        // Open safety report form
        this.showNotification('Opening safety report form...', 'info');
        window.location.href = 'safety-report.html';
    }

    openWageIssue() {
        // Open wage issue form
        this.showNotification('Opening wage issue form...', 'info');
        window.location.href = 'wage-issue.html';
    }

    openHarassmentReport() {
        // Open harassment report form
        this.showNotification('Opening harassment report form...', 'info');
        window.location.href = 'harassment-report.html';
    }

    openWorkingConditions() {
        // Open working conditions form
        this.showNotification('Opening working conditions form...', 'info');
        window.location.href = 'working-conditions.html';
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
                'app-title': 'Worker App',
                'app-subtitle': 'Safe, anonymous access to grievance reporting and support',
                'emergency-title': '🚨 Emergency Contact',
                'emergency-description': 'If you\'re in immediate danger or need urgent assistance, contact these numbers:',
                'emergency-phone': '+855 012 345 678',
                'emergency-hotline': 'Hotline: +855 098 765 432',
                'grievance-title': 'Submit Grievance',
                'grievance-description': 'Report workplace issues, harassment, safety concerns, or other grievances anonymously',
                'grievance-btn-text': 'Submit Report',
                'tracking-title': 'Track Case',
                'tracking-description': 'Check the status of your submitted grievance using your case number',
                'tracking-btn-text': 'Track Case',
                'support-title': 'Get Support',
                'support-description': 'Access resources, FAQs, and contact information for additional support',
                'support-btn-text': 'Get Help',
                'quick-actions-title': 'Quick Actions',
                'safety-title': 'Safety Report',
                'safety-description': 'Report safety hazards or incidents',
                'wage-title': 'Wage Issue',
                'wage-description': 'Report payment or wage-related problems',
                'harassment-title': 'Harassment',
                'harassment-description': 'Report harassment or discrimination',
                'conditions-title': 'Working Conditions',
                'conditions-description': 'Report poor working conditions',
                'qr-title': '📱 Mobile Access',
                'qr-description': 'Scan this QR code with your phone to access the Worker App',
                'qr-instructions': 'Point your phone camera at this code to open the Worker App',
                'whatsapp-title': '💬 WhatsApp Support',
                'whatsapp-description': 'Get support and submit grievances via WhatsApp',
                'whatsapp-btn-text': 'Chat on WhatsApp',
                'whatsapp-note': 'Available 24/7 for urgent issues',
                'kiosk-title': '🖥️ Kiosk Mode',
                'kiosk-description': 'Use the factory kiosk for easy access',
                'kiosk-btn-text': 'Enter Kiosk Mode',
                'kiosk-note': 'Optimized for touch-screen factory kiosks',
                'hotline-title': '📞 Hotline Support',
                'hotline-description': 'Call our dedicated hotline for immediate assistance',
                'hotline-number': '+855 098 765 432',
                'hotline-btn-text': 'Call Now',
                'hotline-hours': 'Available 24/7 • Free call',
                'safety-info-title': '🛡️ Your Safety & Rights',
                'tip1-title': 'Anonymous Reporting',
                'tip1-text': 'All reports are completely anonymous. Your identity is protected.',
                'tip2-title': 'No Retaliation',
                'tip2-text': 'It\'s illegal for anyone to retaliate against you for reporting issues.',
                'tip3-title': '24/7 Support',
                'tip3-text': 'Help is available around the clock through multiple channels.',
                'tip4-title': 'Legal Protection',
                'tip4-text': 'You have legal rights and protections when reporting workplace issues.',
                'footer-title': 'Need More Help?',
                'footer-email': 'Email: worker-support@angkorcompliance.com',
                'footer-hours': 'Support Hours: 24/7',
                'footer-languages': 'Languages: English, Khmer, Thai, Vietnamese',
                'lang-text': 'English'
            },
            km: {
                'app-title': 'កម្មករកម្ម App',
                'app-subtitle': 'ការចូលប្រើដែលមានសុវត្ថិភាព និងអនាមិកដើម្បីរាយការណ៍ពាក្យបណ្តឹង និងការគាំទ្រ',
                'emergency-title': '🚨 ទំនាក់ទំនងអាសន្ន',
                'emergency-description': 'ប្រសិនបើអ្នកស្ថិតក្នុងគ្រោះថ្នាក់ភ្លាមៗ ឬត្រូវការជំនួយអាសន្ន សូមទាក់ទងលេខទូរស័ព្ទទាំងនេះ:',
                'emergency-phone': '+855 012 345 678',
                'emergency-hotline': 'លេខអាសន្ន: +855 098 765 432',
                'grievance-title': 'ដាក់ពាក្យបណ្តឹង',
                'grievance-description': 'រាយការណ៍បញ្ហាកន្លែងធ្វើការ ការរំលោភ ការព្រួយបារម្ភអំពីសុវត្ថិភាព ឬពាក្យបណ្តឹងផ្សេងទៀតដោយអនាមិក',
                'grievance-btn-text': 'ដាក់ពាក្យបណ្តឹង',
                'tracking-title': 'តាមដានករណី',
                'tracking-description': 'ពិនិត្យមើលស្ថានភាពពាក្យបណ្តឹងដែលអ្នកបានដាក់ដោយប្រើលេខករណីរបស់អ្នក',
                'tracking-btn-text': 'តាមដានករណី',
                'support-title': 'ទទួលបានការគាំទ្រ',
                'support-description': 'ចូលប្រើធនធាន សំណួរដែលសួរញឹកញាប់ និងព័ត៌មានទំនាក់ទំនងសម្រាប់ការគាំទ្របន្ថែម',
                'support-btn-text': 'ទទួលបានជំនួយ',
                'quick-actions-title': 'សកម្មភាពរហ័ស',
                'safety-title': 'រាយការណ៍សុវត្ថិភាព',
                'safety-description': 'រាយការណ៍គ្រោះថ្នាក់ ឬឧបទ្ទេសសុវត្ថិភាព',
                'wage-title': 'បញ្ហាប្រាក់ខែ',
                'wage-description': 'រាយការណ៍បញ្ហាទាក់ទងនឹងការទូទាត់ ឬប្រាក់ខែ',
                'harassment-title': 'ការរំលោភ',
                'harassment-description': 'រាយការណ៍ការរំលោភ ឬការរើសអើង',
                'conditions-title': 'លក្ខខណ្ឌការងារ',
                'conditions-description': 'រាយការណ៍លក្ខខណ្ឌការងារអាក្រក់',
                'qr-title': '📱 ការចូលប្រើចល័ត',
                'qr-description': 'ស្កេនកូដ QR នេះជាមួយទូរស័ព្ទរបស់អ្នកដើម្បីចូលប្រើកម្មករកម្ម App',
                'qr-instructions': 'ចង្អុលកាមេរ៉ាទូរស័ព្ទរបស់អ្នកទៅកាន់កូដនេះដើម្បីបើកកម្មករកម្ម App',
                'whatsapp-title': '💬 ការគាំទ្រ WhatsApp',
                'whatsapp-description': 'ទទួលបានការគាំទ្រ និងដាក់ពាក្យបណ្តឹងតាមរយៈ WhatsApp',
                'whatsapp-btn-text': 'ជជែកលើ WhatsApp',
                'whatsapp-note': 'មាន 24/7 សម្រាប់បញ្ហាអាសន្ន',
                'kiosk-title': '🖥️ របៀប Kiosk',
                'kiosk-description': 'ប្រើ kiosk រោងចក្រសម្រាប់ការចូលប្រើងាយស្រួល',
                'kiosk-btn-text': 'ចូលរបៀប Kiosk',
                'kiosk-note': 'បានធ្វើឱ្យប្រសើរឡើងសម្រាប់ kiosk រោងចក្រអេក្រង់ប៉ះ',
                'hotline-title': '📞 ការគាំទ្រ Hotline',
                'hotline-description': 'ហៅលេខ hotline ដែលបានឧទ្ទិសដើម្បីជំនួយភ្លាមៗ',
                'hotline-number': '+855 098 765 432',
                'hotline-btn-text': 'ហៅឥឡូវនេះ',
                'hotline-hours': 'មាន 24/7 • ការហៅឥតគិតថ្លៃ',
                'safety-info-title': '🛡️ សុវត្ថិភាព និងសិទ្ធិរបស់អ្នក',
                'tip1-title': 'ការរាយការណ៍អនាមិក',
                'tip1-text': 'រាយការណ៍ទាំងអស់គឺអនាមិកទាំងស្រុង។ អត្តសញ្ញាណកម្មរបស់អ្នកត្រូវបានការពារ។',
                'tip2-title': 'គ្មានការវិនិច្ឆ័យ',
                'tip2-text': 'វាមិនត្រឹមត្រូវសម្រាប់នរណាម្នាក់វិនិច្ឆ័យអ្នកដោយសាររាយការណ៍បញ្ហា។',
                'tip3-title': 'ការគាំទ្រ 24/7',
                'tip3-text': 'ជំនួយមានជាប់ជាប់ជាមួយនឹងពេលវេលាតាមរយៈឆានែលច្រើន។',
                'tip4-title': 'ការការពារផ្នែកច្បាប់',
                'tip4-text': 'អ្នកមានសិទ្ធិផ្នែកច្បាប់ និងការការពារនៅពេលរាយការណ៍បញ្ហាកន្លែងធ្វើការ។',
                'footer-title': 'ត្រូវការជំនួយបន្ថែម?',
                'footer-email': 'អ៊ីមែល: worker-support@angkorcompliance.com',
                'footer-hours': 'ម៉ោងគាំទ្រ: 24/7',
                'footer-languages': 'ភាសា: អង់គ្លេស ខ្មែរ ថៃ វៀតណាម',
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
let workerApp;

document.addEventListener('DOMContentLoaded', () => {
    workerApp = new WorkerApp();
});

// Global functions for HTML onclick handlers
window.workerApp = null;

window.toggleLanguage = function() {
    if (workerApp) {
        workerApp.toggleLanguage();
    }
};

// Make functions globally accessible
window.openGrievanceForm = function() {
    if (workerApp) {
        workerApp.openGrievanceForm();
    }
};

window.openCaseTracking = function() {
    if (workerApp) {
        workerApp.openCaseTracking();
    }
};

window.openSupport = function() {
    if (workerApp) {
        workerApp.openSupport();
    }
};

window.openSafetyReport = function() {
    if (workerApp) {
        workerApp.openSafetyReport();
    }
};

window.openWageIssue = function() {
    if (workerApp) {
        workerApp.openWageIssue();
    }
};

window.openHarassmentReport = function() {
    if (workerApp) {
        workerApp.openHarassmentReport();
    }
};

window.openWorkingConditions = function() {
    if (workerApp) {
        workerApp.openWorkingConditions();
    }
};
