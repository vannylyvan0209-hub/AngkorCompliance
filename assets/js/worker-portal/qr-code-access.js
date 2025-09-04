import { initializeFirebase } from '../../firebase-config.js';

class QRCodeAccess {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentLanguage = 'en';
        this.qrCodeUrl = null;
        this.languages = {
            en: {
                title: 'QR Code Access',
                subtitle: 'Scan this QR code to access the grievance system on your mobile device',
                howToUse: 'How to Use',
                step1: 'Open your phone\'s camera app',
                step2: 'Point it at the QR code above',
                step3: 'Tap the notification that appears',
                step4: 'Access the grievance system',
                otherMethods: 'Other Access Methods',
                webPortal: 'Web Portal',
                webPortalDesc: 'Access via web browser',
                mobileInterface: 'Mobile Interface',
                mobileInterfaceDesc: 'Optimized for mobile devices',
                factoryKiosk: 'Factory Kiosk',
                factoryKioskDesc: 'Use factory kiosk stations',
                whatsapp: 'WhatsApp',
                whatsappDesc: 'Submit via WhatsApp',
                hotline: 'Hotline',
                hotlineDesc: 'Call +855 12 345 678'
            },
            km: {
                title: 'ការចូលប្រើតាមរយៈ QR Code',
                subtitle: 'ស្កេន QR code នេះដើម្បីចូលប្រើប្រព័ន្ធការប្តឹងរក្សានៅលើឧបករណ៍ចល័តរបស់អ្នក',
                howToUse: 'របៀបប្រើប្រាស់',
                step1: 'បើកកម្មវិធីកាមេរ៉ានៅលើទូរស័ព្ទរបស់អ្នក',
                step2: 'ចង្អុលទៅ QR code ខាងលើ',
                step3: 'ចុចលើការជូនដំណឹងដែលបង្ហាញ',
                step4: 'ចូលប្រើប្រព័ន្ធការប្តឹងរក្សា',
                otherMethods: 'វិធីចូលប្រើផ្សេងទៀត',
                webPortal: 'វ៉ែបផ័រថាល',
                webPortalDesc: 'ចូលប្រើតាមរយៈវែបប្រាយស័រ',
                mobileInterface: 'ចំណុចប្រទាក់ចល័ត',
                mobileInterfaceDesc: 'បានធ្វើឱ្យប្រសើរឡើងសម្រាប់ឧបករណ៍ចល័ត',
                factoryKiosk: 'គីយូសខរ៉ាកថូរី',
                factoryKioskDesc: 'ប្រើស្ថានីយ៍គីយូសខរ៉ាកថូរី',
                whatsapp: 'WhatsApp',
                whatsappDesc: 'ដាក់ស្នើតាមរយៈ WhatsApp',
                hotline: 'លេខទូរស័ព្ទជួយ',
                hotlineDesc: 'ហៅ +855 12 345 678'
            },
            th: {
                title: 'การเข้าถึงผ่าน QR Code',
                subtitle: 'สแกน QR code นี้เพื่อเข้าถึงระบบร้องเรียนบนอุปกรณ์มือถือของคุณ',
                howToUse: 'วิธีใช้งาน',
                step1: 'เปิดแอปกล้องในโทรศัพท์ของคุณ',
                step2: 'ชี้ไปที่ QR code ด้านบน',
                step3: 'แตะการแจ้งเตือนที่ปรากฏ',
                step4: 'เข้าถึงระบบร้องเรียน',
                otherMethods: 'วิธีการเข้าถึงอื่นๆ',
                webPortal: 'เว็บพอร์ทัล',
                webPortalDesc: 'เข้าถึงผ่านเว็บเบราว์เซอร์',
                mobileInterface: 'อินเทอร์เฟซมือถือ',
                mobileInterfaceDesc: 'ปรับให้เหมาะสำหรับอุปกรณ์มือถือ',
                factoryKiosk: 'ตู้คิออสก์โรงงาน',
                factoryKioskDesc: 'ใช้สถานีตู้คิออสก์โรงงาน',
                whatsapp: 'WhatsApp',
                whatsappDesc: 'ส่งผ่าน WhatsApp',
                hotline: 'สายด่วน',
                hotlineDesc: 'โทร +855 12 345 678'
            },
            vi: {
                title: 'Truy cập qua QR Code',
                subtitle: 'Quét mã QR này để truy cập hệ thống khiếu nại trên thiết bị di động của bạn',
                howToUse: 'Cách sử dụng',
                step1: 'Mở ứng dụng camera trên điện thoại của bạn',
                step2: 'Hướng vào mã QR ở trên',
                step3: 'Nhấn vào thông báo xuất hiện',
                step4: 'Truy cập hệ thống khiếu nại',
                otherMethods: 'Các phương thức truy cập khác',
                webPortal: 'Cổng web',
                webPortalDesc: 'Truy cập qua trình duyệt web',
                mobileInterface: 'Giao diện di động',
                mobileInterfaceDesc: 'Tối ưu hóa cho thiết bị di động',
                factoryKiosk: 'Kiosk nhà máy',
                factoryKioskDesc: 'Sử dụng trạm kiosk nhà máy',
                whatsapp: 'WhatsApp',
                whatsappDesc: 'Gửi qua WhatsApp',
                hotline: 'Đường dây nóng',
                hotlineDesc: 'Gọi +855 12 345 678'
            }
        };
    }

    async init() {
        try {
            console.log('🚀 Initializing QR Code Access...');
            
            // Initialize Firebase
            await initializeFirebase();
            this.db = window.Firebase?.db;
            this.auth = window.Firebase?.auth;
            
            // Generate QR code URL
            this.generateQRCodeURL();
            
            // Generate QR code
            await this.generateQRCode();
            
            // Set up event listeners
            this.setupEventListeners();
            
            console.log('✅ QR Code Access initialized');
            
        } catch (error) {
            console.error('❌ QR Code Access initialization failed:', error);
            this.showError('Failed to initialize QR code access');
        }
    }

    generateQRCodeURL() {
        // Generate a unique URL for this QR code session
        const baseUrl = window.location.origin;
        const workerPortalUrl = `${baseUrl}/worker-portal.html`;
        
        // Add session parameters for tracking
        const sessionId = this.generateSessionId();
        const timestamp = Date.now();
        
        this.qrCodeUrl = `${workerPortalUrl}?source=qr&session=${sessionId}&t=${timestamp}`;
        
        console.log('Generated QR code URL:', this.qrCodeUrl);
    }

    generateSessionId() {
        // Generate a unique session ID
        return 'qr_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    }

    async generateQRCode() {
        try {
            const qrCodeContainer = document.getElementById('qrCode');
            
            if (!qrCodeContainer) {
                console.error('QR code container not found');
                return;
            }

            // Clear existing QR code
            qrCodeContainer.innerHTML = '';

            // Generate QR code using QRCode.js library
            await QRCode.toCanvas(qrCodeContainer, this.qrCodeUrl, {
                width: 180,
                height: 180,
                margin: 2,
                color: {
                    dark: '#1f2937',
                    light: '#ffffff'
                }
            });

            console.log('QR code generated successfully');
            this.showSuccess('QR code generated successfully');

        } catch (error) {
            console.error('Failed to generate QR code:', error);
            this.showError('Failed to generate QR code');
            
            // Fallback: show URL as text
            const qrCodeContainer = document.getElementById('qrCode');
            qrCodeContainer.innerHTML = `
                <div style="padding: var(--space-4); text-align: center;">
                    <p style="margin: 0; font-size: 0.8rem; color: var(--text-secondary);">
                        QR Code generation failed.<br>
                        Please visit:<br>
                        <strong>${this.qrCodeUrl}</strong>
                    </p>
                </div>
            `;
        }
    }

    setupEventListeners() {
        // Language selector change
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }

        // Track QR code scans (if possible)
        this.trackQRCodeUsage();
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
            
            // Store language preference
            localStorage.setItem('preferredLanguage', languageCode);
            
            console.log('Language changed to:', languageCode);
            
        } catch (error) {
            console.error('Failed to change language:', error);
        }
    }

    updatePageContent(translations) {
        // Update header
        const header = document.querySelector('.qr-header h1');
        if (header) {
            header.innerHTML = `<i data-lucide="qr-code"></i> ${translations.title}`;
        }

        const subtitle = document.querySelector('.qr-header p');
        if (subtitle) {
            subtitle.textContent = translations.subtitle;
        }

        // Update instructions
        const howToUse = document.querySelector('.qr-instructions h3');
        if (howToUse) {
            howToUse.innerHTML = `<i data-lucide="smartphone"></i> ${translations.howToUse}`;
        }

        const steps = document.querySelectorAll('.qr-instructions li');
        if (steps.length >= 4) {
            steps[0].textContent = translations.step1;
            steps[1].textContent = translations.step2;
            steps[2].textContent = translations.step3;
            steps[3].textContent = translations.step4;
        }

        // Update access options
        const otherMethods = document.querySelector('.access-options h3');
        if (otherMethods) {
            otherMethods.textContent = translations.otherMethods;
        }

        // Update access option details
        const accessOptions = document.querySelectorAll('.access-details h4');
        const accessDescriptions = document.querySelectorAll('.access-details p');
        
        if (accessOptions.length >= 5 && accessDescriptions.length >= 5) {
            accessOptions[0].textContent = translations.webPortal;
            accessDescriptions[0].textContent = translations.webPortalDesc;
            
            accessOptions[1].textContent = translations.mobileInterface;
            accessDescriptions[1].textContent = translations.mobileInterfaceDesc;
            
            accessOptions[2].textContent = translations.factoryKiosk;
            accessDescriptions[2].textContent = translations.factoryKioskDesc;
            
            accessOptions[3].textContent = translations.whatsapp;
            accessDescriptions[3].textContent = translations.whatsappDesc;
            
            accessOptions[4].textContent = translations.hotline;
            accessDescriptions[4].textContent = translations.hotlineDesc;
        }

        // Recreate icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    async trackQRCodeUsage() {
        try {
            // Log QR code generation for analytics
            await this.logQRCodeEvent('generated');
            
            // Set up periodic tracking
            setInterval(() => {
                this.logQRCodeEvent('active');
            }, 300000); // Every 5 minutes
            
        } catch (error) {
            console.error('Failed to track QR code usage:', error);
        }
    }

    async logQRCodeEvent(eventType) {
        try {
            if (!this.db) return;

            const eventData = {
                eventType: eventType,
                qrCodeUrl: this.qrCodeUrl,
                language: this.currentLanguage,
                userAgent: navigator.userAgent,
                timestamp: new Date(),
                sessionId: this.qrCodeUrl.split('session=')[1]?.split('&')[0]
            };

            await this.db.collection('qr_code_events').add(eventData);
            
        } catch (error) {
            console.error('Failed to log QR code event:', error);
        }
    }

    // Navigation functions
    callHotline() {
        window.location.href = 'tel:+85512345678';
    }

    // Utility functions
    showSuccess(message) {
        this.showStatus(message, 'success');
    }

    showError(message) {
        this.showStatus(message, 'error');
    }

    showInfo(message) {
        this.showStatus(message, 'info');
    }

    showStatus(message, type) {
        const statusElement = document.getElementById('qrStatus');
        if (!statusElement) return;

        statusElement.className = `qr-status ${type}`;
        statusElement.textContent = message;
        statusElement.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 5000);
    }
}

// Global functions for button actions
function changeLanguage() {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect && window.qrCodeAccess) {
        window.qrCodeAccess.changeLanguage(languageSelect.value);
    }
}

function callHotline() {
    window.qrCodeAccess?.callHotline();
}

// Initialize QR code access
let qrCodeAccess;
document.addEventListener('DOMContentLoaded', () => {
    qrCodeAccess = new QRCodeAccess();
    window.qrCodeAccess = qrCodeAccess;
    qrCodeAccess.init();
});
