import { initializeFirebase } from '../../firebase-config.js';

class MobileInterface {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentLanguage = 'en';
        this.isLanguageMenuOpen = false;
        this.languages = {
            en: {
                title: 'Grievance Portal',
                subtitle: 'Submit and track your concerns safely',
                submitGrievance: 'Submit Grievance',
                submitGrievanceDesc: 'Report a concern or issue anonymously',
                trackCase: 'Track Your Case',
                trackCaseDesc: 'Check the status of your submitted cases',
                myDashboard: 'My Dashboard',
                myDashboardDesc: 'View your case history and statistics',
                callSupport: 'Call Support',
                help: 'Help',
                emergency: 'Emergency',
                settings: 'Settings',
                contactInfo: 'Contact Information',
                grievanceHotline: 'Grievance Hotline',
                emailSupport: 'Email Support',
                whatsapp: 'WhatsApp',
                whatsappDesc: 'Send message via WhatsApp',
                officeLocation: 'Office Location',
                statusReady: 'Ready to submit grievance',
                statusLoading: 'Loading...',
                statusError: 'Error occurred'
            },
            km: {
                title: 'ផ័រថាលការប្តឹងរក្សា',
                subtitle: 'ដាក់ស្នើនិងតាមដានការព្រួយបារម្ភរបស់អ្នកយ៉ាងសុវត្ថិភាព',
                submitGrievance: 'ដាក់ស្នើការប្តឹងរក្សា',
                submitGrievanceDesc: 'រាយការណ៍ការព្រួយបារម្ភឬបញ្ហាដោយអនាមិក',
                trackCase: 'តាមដានករណីរបស់អ្នក',
                trackCaseDesc: 'ពិនិត្យស្ថានភាពនៃករណីដែលអ្នកបានដាក់ស្នើ',
                myDashboard: 'ផ្ទាំងគ្រប់គ្រងរបស់ខ្ញុំ',
                myDashboardDesc: 'មើលប្រវត្តិករណីនិងស្ថិតិរបស់អ្នក',
                callSupport: 'ហៅជួយ',
                help: 'ជួយ',
                emergency: 'អាសន្ន',
                settings: 'ការកំណត់',
                contactInfo: 'ព័ត៌មានទំនាក់ទំនង',
                grievanceHotline: 'លេខទូរស័ព្ទការប្តឹងរក្សា',
                emailSupport: 'អ៊ីមែលជួយ',
                whatsapp: 'WhatsApp',
                whatsappDesc: 'ផ្ញើសារតាមរយៈ WhatsApp',
                officeLocation: 'ទីតាំងការិយាល័យ',
                statusReady: 'រួចរាល់ដើម្បីដាក់ស្នើការប្តឹងរក្សា',
                statusLoading: 'កំពុងផ្ទុក...',
                statusError: 'មានកំហុសកើតឡើង'
            },
            th: {
                title: 'พอร์ทัลร้องเรียน',
                subtitle: 'ส่งและติดตามข้อกังวลของคุณอย่างปลอดภัย',
                submitGrievance: 'ส่งคำร้องเรียน',
                submitGrievanceDesc: 'รายงานข้อกังวลหรือปัญหาอย่างไม่ระบุตัวตน',
                trackCase: 'ติดตามคดีของคุณ',
                trackCaseDesc: 'ตรวจสอบสถานะของคดีที่คุณส่ง',
                myDashboard: 'แดชบอร์ดของฉัน',
                myDashboardDesc: 'ดูประวัติคดีและสถิติของคุณ',
                callSupport: 'โทรหาฝ่ายสนับสนุน',
                help: 'ช่วยเหลือ',
                emergency: 'ฉุกเฉิน',
                settings: 'การตั้งค่า',
                contactInfo: 'ข้อมูลติดต่อ',
                grievanceHotline: 'สายด่วนร้องเรียน',
                emailSupport: 'อีเมลสนับสนุน',
                whatsapp: 'WhatsApp',
                whatsappDesc: 'ส่งข้อความผ่าน WhatsApp',
                officeLocation: 'ที่ตั้งสำนักงาน',
                statusReady: 'พร้อมส่งคำร้องเรียน',
                statusLoading: 'กำลังโหลด...',
                statusError: 'เกิดข้อผิดพลาด'
            },
            vi: {
                title: 'Cổng Khiếu Nại',
                subtitle: 'Gửi và theo dõi mối quan tâm của bạn một cách an toàn',
                submitGrievance: 'Gửi Khiếu Nại',
                submitGrievanceDesc: 'Báo cáo mối quan tâm hoặc vấn đề một cách ẩn danh',
                trackCase: 'Theo Dõi Vụ Việc',
                trackCaseDesc: 'Kiểm tra trạng thái vụ việc bạn đã gửi',
                myDashboard: 'Bảng Điều Khiển',
                myDashboardDesc: 'Xem lịch sử vụ việc và thống kê của bạn',
                callSupport: 'Gọi Hỗ Trợ',
                help: 'Trợ Giúp',
                emergency: 'Khẩn Cấp',
                settings: 'Cài Đặt',
                contactInfo: 'Thông Tin Liên Hệ',
                grievanceHotline: 'Đường Dây Nóng Khiếu Nại',
                emailSupport: 'Email Hỗ Trợ',
                whatsapp: 'WhatsApp',
                whatsappDesc: 'Gửi tin nhắn qua WhatsApp',
                officeLocation: 'Vị Trí Văn Phòng',
                statusReady: 'Sẵn sàng gửi khiếu nại',
                statusLoading: 'Đang tải...',
                statusError: 'Đã xảy ra lỗi'
            }
        };
    }

    async init() {
        try {
            console.log('🚀 Initializing Mobile Interface...');
            
            // Initialize Firebase
            await initializeFirebase();
            this.db = window.Firebase?.db;
            this.auth = window.Firebase?.auth;
            
            // Load saved language preference
            this.loadLanguagePreference();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Update status
            this.updateStatus('ready');
            
            console.log('✅ Mobile Interface initialized');
            
        } catch (error) {
            console.error('❌ Mobile Interface initialization failed:', error);
            this.updateStatus('error');
        }
    }

    loadLanguagePreference() {
        const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
        this.changeLanguage(savedLanguage);
        
        // Update language selector
        this.updateLanguageSelector(savedLanguage);
    }

    setupEventListeners() {
        // Close language menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-selector')) {
                this.closeLanguageMenu();
            }
        });

        // Handle touch events for better mobile experience
        this.setupTouchEvents();

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });

        // Handle visibility change (app switching)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handleAppResume();
            }
        });
    }

    setupTouchEvents() {
        // Add touch feedback to all interactive elements
        const interactiveElements = document.querySelectorAll('.action-card, .quick-action, .contact-item, .fab, .language-btn');
        
        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', (e) => {
                element.style.transform = 'scale(0.95)';
            });
            
            element.addEventListener('touchend', (e) => {
                element.style.transform = '';
            });
        });
    }

    handleOrientationChange() {
        // Adjust layout for orientation change
        console.log('Orientation changed');
        this.updateLayout();
    }

    handleAppResume() {
        // Handle when app comes back to foreground
        console.log('App resumed');
        this.updateStatus('ready');
    }

    updateLayout() {
        // Adjust layout based on screen size and orientation
        const isPortrait = window.innerHeight > window.innerWidth;
        const isSmallScreen = window.innerWidth < 480;
        
        // Add responsive adjustments here if needed
        console.log('Layout updated - Portrait:', isPortrait, 'Small screen:', isSmallScreen);
    }

    // Navigation functions
    submitGrievance() {
        this.updateStatus('loading');
        window.location.href = '../../worker-portal.html?source=mobile';
    }

    trackCase() {
        this.updateStatus('loading');
        window.location.href = 'case-tracking-portal.html?source=mobile';
    }

    viewDashboard() {
        this.updateStatus('loading');
        window.location.href = 'worker-dashboard.html?source=mobile';
    }

    contactSupport() {
        this.callHotline();
    }

    viewResources() {
        // Show help resources modal
        this.showHelpModal();
    }

    emergencyContact() {
        // Show emergency contact options
        this.showEmergencyModal();
    }

    settings() {
        // Show settings modal
        this.showSettingsModal();
    }

    callHotline() {
        window.location.href = 'tel:+85512345678';
    }

    sendEmail() {
        window.location.href = 'mailto:grievance@angkorcompliance.com';
    }

    openWhatsApp() {
        const message = encodeURIComponent('Hello, I need help with a grievance submission.');
        window.location.href = `https://wa.me/85512345678?text=${message}`;
    }

    viewOffice() {
        // Show office location on map
        this.showOfficeLocation();
    }

    // Language functions
    toggleLanguageMenu() {
        this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
        const menu = document.getElementById('languageMenu');
        
        if (this.isLanguageMenuOpen) {
            menu.classList.add('show');
        } else {
            menu.classList.remove('show');
        }
    }

    closeLanguageMenu() {
        this.isLanguageMenuOpen = false;
        const menu = document.getElementById('languageMenu');
        menu.classList.remove('show');
    }

    changeLanguage(languageCode) {
        try {
            this.currentLanguage = languageCode;
            const translations = this.languages[languageCode];
            
            if (!translations) {
                console.error('Translations not found for language:', languageCode);
                return;
            }

            // Update page content
            this.updatePageContent(translations);
            
            // Update language selector
            this.updateLanguageSelector(languageCode);
            
            // Store language preference
            localStorage.setItem('preferredLanguage', languageCode);
            
            // Close language menu
            this.closeLanguageMenu();
            
            console.log('Language changed to:', languageCode);
            
        } catch (error) {
            console.error('Failed to change language:', error);
        }
    }

    updateLanguageSelector(selectedLanguage) {
        const languageOptions = document.querySelectorAll('.language-option');
        languageOptions.forEach(option => {
            option.classList.remove('active');
            if (option.textContent.includes(this.getLanguageName(selectedLanguage))) {
                option.classList.add('active');
            }
        });
    }

    getLanguageName(code) {
        const names = {
            'en': 'English',
            'km': 'ខ្មែរ',
            'th': 'ไทย',
            'vi': 'Tiếng Việt'
        };
        return names[code] || 'English';
    }

    updatePageContent(translations) {
        // Update header
        const header = document.querySelector('.mobile-header h1');
        if (header) {
            header.innerHTML = `<i data-lucide="smartphone"></i> ${translations.title}`;
        }

        const subtitle = document.querySelector('.mobile-header p');
        if (subtitle) {
            subtitle.textContent = translations.subtitle;
        }

        // Update action cards
        const actionCards = document.querySelectorAll('.action-details h3');
        const actionDescriptions = document.querySelectorAll('.action-details p');
        
        if (actionCards.length >= 3 && actionDescriptions.length >= 3) {
            actionCards[0].textContent = translations.submitGrievance;
            actionDescriptions[0].textContent = translations.submitGrievanceDesc;
            
            actionCards[1].textContent = translations.trackCase;
            actionDescriptions[1].textContent = translations.trackCaseDesc;
            
            actionCards[2].textContent = translations.myDashboard;
            actionDescriptions[2].textContent = translations.myDashboardDesc;
        }

        // Update quick actions
        const quickActions = document.querySelectorAll('.quick-action h4');
        if (quickActions.length >= 4) {
            quickActions[0].textContent = translations.callSupport;
            quickActions[1].textContent = translations.help;
            quickActions[2].textContent = translations.emergency;
            quickActions[3].textContent = translations.settings;
        }

        // Update contact section
        const contactSection = document.querySelector('.contact-section h3');
        if (contactSection) {
            contactSection.innerHTML = `<i data-lucide="phone"></i> ${translations.contactInfo}`;
        }

        const contactItems = document.querySelectorAll('.contact-details h4');
        const contactDescriptions = document.querySelectorAll('.contact-details p');
        
        if (contactItems.length >= 4 && contactDescriptions.length >= 4) {
            contactItems[0].textContent = translations.grievanceHotline;
            contactItems[1].textContent = translations.emailSupport;
            contactItems[2].textContent = translations.whatsapp;
            contactDescriptions[2].textContent = translations.whatsappDesc;
            contactItems[3].textContent = translations.officeLocation;
        }

        // Recreate icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    updateStatus(status) {
        const statusElement = document.getElementById('statusText');
        if (!statusElement) return;

        const statusMessages = {
            ready: this.languages[this.currentLanguage]?.statusReady || 'Ready to submit grievance',
            loading: this.languages[this.currentLanguage]?.statusLoading || 'Loading...',
            error: this.languages[this.currentLanguage]?.statusError || 'Error occurred'
        };

        statusElement.textContent = statusMessages[status] || statusMessages.ready;
    }

    // Modal functions
    showHelpModal() {
        const modal = this.createModal('Help Resources', `
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                <div onclick="window.mobileInterface.openResource('guide')" style="padding: var(--space-3); border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer;">
                    <h4>Submission Guide</h4>
                    <p>Learn how to submit a grievance properly</p>
                </div>
                <div onclick="window.mobileInterface.openResource('rights')" style="padding: var(--space-3); border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer;">
                    <h4>Worker Rights</h4>
                    <p>Understand your rights and protections</p>
                </div>
                <div onclick="window.mobileInterface.openResource('faq')" style="padding: var(--space-3); border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer;">
                    <h4>FAQ</h4>
                    <p>Frequently asked questions</p>
                </div>
            </div>
        `);
        document.body.appendChild(modal);
    }

    showEmergencyModal() {
        const modal = this.createModal('Emergency Contact', `
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                <div onclick="window.location.href='tel:119'" style="padding: var(--space-3); border: 1px solid var(--red-200); border-radius: var(--radius-md); cursor: pointer; background: var(--red-50);">
                    <h4 style="color: var(--red-700);">Emergency Services</h4>
                    <p>Call 119 for immediate emergency assistance</p>
                </div>
                <div onclick="window.location.href='tel:+85512345678'" style="padding: var(--space-3); border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer;">
                    <h4>Grievance Hotline</h4>
                    <p>+855 12 345 678</p>
                </div>
            </div>
        `);
        document.body.appendChild(modal);
    }

    showSettingsModal() {
        const modal = this.createModal('Settings', `
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                <div>
                    <label>Language</label>
                    <select onchange="window.mobileInterface.changeLanguage(this.value)">
                        <option value="en">English</option>
                        <option value="km">ខ្មែរ</option>
                        <option value="th">ไทย</option>
                        <option value="vi">Tiếng Việt</option>
                    </select>
                </div>
                <div>
                    <label>Notifications</label>
                    <input type="checkbox" checked> Enable notifications
                </div>
            </div>
        `);
        document.body.appendChild(modal);
    }

    showOfficeLocation() {
        const modal = this.createModal('Office Location', `
            <div style="text-align: center;">
                <h4>HR Department, Building A</h4>
                <p>Factory Complex, Phnom Penh, Cambodia</p>
                <p>Hours: Mon-Fri 8:00 AM - 5:00 PM</p>
                <button onclick="window.open('https://maps.google.com')" style="margin-top: var(--space-3); padding: var(--space-2) var(--space-4); background: var(--primary-600); color: white; border: none; border-radius: var(--radius-md);">
                    Open in Maps
                </button>
            </div>
        `);
        document.body.appendChild(modal);
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: var(--radius-lg); padding: var(--space-4); margin: var(--space-4); max-width: 400px; width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
                    <h3 style="margin: 0;">${title}</h3>
                    <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
                </div>
                ${content}
            </div>
        `;
        
        modal.className = 'modal';
        return modal;
    }

    openResource(resourceType) {
        const resources = {
            guide: { title: 'Submission Guide', content: 'How to submit a grievance step by step...' },
            rights: { title: 'Worker Rights', content: 'Your rights and protections under the law...' },
            faq: { title: 'FAQ', content: 'Common questions and answers...' }
        };

        const resource = resources[resourceType];
        if (resource) {
            const modal = this.createModal(resource.title, `<p>${resource.content}</p>`);
            document.body.appendChild(modal);
        }
    }
}

// Global functions for button actions
function submitGrievance() {
    window.mobileInterface?.submitGrievance();
}

function trackCase() {
    window.mobileInterface?.trackCase();
}

function viewDashboard() {
    window.mobileInterface?.viewDashboard();
}

function contactSupport() {
    window.mobileInterface?.contactSupport();
}

function viewResources() {
    window.mobileInterface?.viewResources();
}

function emergencyContact() {
    window.mobileInterface?.emergencyContact();
}

function settings() {
    window.mobileInterface?.settings();
}

function callHotline() {
    window.mobileInterface?.callHotline();
}

function sendEmail() {
    window.mobileInterface?.sendEmail();
}

function openWhatsApp() {
    window.mobileInterface?.openWhatsApp();
}

function viewOffice() {
    window.mobileInterface?.viewOffice();
}

function toggleLanguageMenu() {
    window.mobileInterface?.toggleLanguageMenu();
}

function changeLanguage(languageCode) {
    window.mobileInterface?.changeLanguage(languageCode);
}

// Initialize mobile interface
let mobileInterface;
document.addEventListener('DOMContentLoaded', () => {
    mobileInterface = new MobileInterface();
    window.mobileInterface = mobileInterface;
    mobileInterface.init();
});
