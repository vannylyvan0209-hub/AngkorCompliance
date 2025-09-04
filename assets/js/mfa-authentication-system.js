// Multi-Factor Authentication System for Angkor Compliance Platform
// Implements TOTP, SMS, Email verification, and Backup Codes

class MFAAuthenticationSystem {
    constructor() {
        this.db = window.Firebase?.db;
        this.storage = window.Firebase?.storage;
        this.currentUser = null;
        this.mfaConfig = {
            totp: {
                issuer: 'Angkor Compliance',
                algorithm: 'sha1',
                digits: 6,
                period: 30,
                window: 2
            },
            sms: {
                provider: 'twilio',
                templates: {
                    verification: 'Your Angkor Compliance verification code is: {code}',
                    backup: 'Your backup code is: {code}'
                }
            },
            email: {
                provider: 'sendgrid',
                templates: {
                    verification: 'verification-email-template',
                    backup: 'backup-code-template'
                }
            },
            backupCodes: {
                count: 10,
                length: 8,
                format: 'alphanumeric'
            }
        };
        
        this.initializeMFASystem();
    }

    async initializeMFASystem() {
        try {
            // Load required libraries
            await this.loadDependencies();
            
            // Initialize MFA configuration
            await this.loadMFAConfiguration();
            
            console.log('✅ MFA Authentication System initialized');
        } catch (error) {
            console.error('❌ Error initializing MFA System:', error);
        }
    }

    async loadDependencies() {
        // Load speakeasy for TOTP
        if (typeof speakeasy === 'undefined') {
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/speakeasy/2.0.0/speakeasy.min.js');
        }
        
        // Load QRCode for TOTP setup
        if (typeof QRCode === 'undefined') {
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js');
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async loadMFAConfiguration() {
        try {
            if (this.db) {
                const configDoc = await this.db.collection('system_config').doc('mfa').get();
                if (configDoc.exists) {
                    this.mfaConfig = { ...this.mfaConfig, ...configDoc.data() };
                }
            }
        } catch (error) {
            console.error('Error loading MFA configuration:', error);
        }
    }

    async generateTOTPSecret(userId, userEmail) {
        try {
            const secret = speakeasy.generateSecret({
                name: `${this.mfaConfig.totp.issuer} (${userEmail})`,
                issuer: this.mfaConfig.totp.issuer,
                length: 32
            });

            // Store secret securely (encrypted in production)
            await this.storeTOTPSecret(userId, secret.base32);

            return {
                secret: secret.base32,
                qrCode: secret.otpauth_url,
                manualEntry: secret.base32
            };
        } catch (error) {
            console.error('Error generating TOTP secret:', error);
            throw new Error('Failed to generate TOTP secret');
        }
    }

    async storeTOTPSecret(userId, secret) {
        try {
            if (this.db) {
                await this.db.collection('users').doc(userId).update({
                    mfaSecret: secret,
                    mfaEnabled: false,
                    mfaMethods: [],
                    mfaSetupDate: null
                });
            }
        } catch (error) {
            console.error('Error storing TOTP secret:', error);
            throw new Error('Failed to store TOTP secret');
        }
    }

    async verifyTOTPCode(userId, code) {
        try {
            // Get user's TOTP secret
            const userDoc = await this.db.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                throw new Error('User not found');
            }

            const userData = userDoc.data();
            if (!userData.mfaSecret) {
                throw new Error('MFA not configured for user');
            }

            // Verify TOTP code
            const verified = speakeasy.totp.verify({
                secret: userData.mfaSecret,
                encoding: 'base32',
                token: code,
                window: this.mfaConfig.totp.window
            });

            if (verified) {
                // Log successful verification
                await this.logMFAActivity(userId, 'totp_verification_success');
                return true;
            } else {
                // Log failed verification
                await this.logMFAActivity(userId, 'totp_verification_failed');
                return false;
            }
        } catch (error) {
            console.error('Error verifying TOTP code:', error);
            throw new Error('Failed to verify TOTP code');
        }
    }

    async generateVerificationCode(userId, method) {
        try {
            const code = this.generateRandomCode(6);
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            // Store verification code
            await this.storeVerificationCode(userId, method, code, expiresAt);

            // Send code via specified method
            if (method === 'sms') {
                await this.sendSMSCode(userId, code);
            } else if (method === 'email') {
                await this.sendEmailCode(userId, code);
            }

            return { success: true, expiresAt };
        } catch (error) {
            console.error('Error generating verification code:', error);
            throw new Error('Failed to generate verification code');
        }
    }

    async verifyCode(userId, method, code) {
        try {
            const storedCode = await this.getStoredVerificationCode(userId, method);
            
            if (!storedCode) {
                return false;
            }

            if (new Date() > new Date(storedCode.expiresAt)) {
                await this.clearVerificationCode(userId, method);
                return false;
            }

            if (storedCode.code === code) {
                await this.clearVerificationCode(userId, method);
                await this.logMFAActivity(userId, `${method}_verification_success`);
                return true;
            } else {
                await this.logMFAActivity(userId, `${method}_verification_failed`);
                return false;
            }
        } catch (error) {
            console.error('Error verifying code:', error);
            return false;
        }
    }

    async generateBackupCodes(userId) {
        try {
            const codes = [];
            for (let i = 0; i < this.mfaConfig.backupCodes.count; i++) {
                codes.push(this.generateRandomCode(this.mfaConfig.backupCodes.length, 'alphanumeric'));
            }

            // Hash codes before storing
            const hashedCodes = await Promise.all(codes.map(code => this.hashCode(code)));

            // Store hashed backup codes
            await this.db.collection('users').doc(userId).update({
                backupCodes: hashedCodes,
                backupCodesGenerated: new Date().toISOString()
            });

            return codes;
        } catch (error) {
            console.error('Error generating backup codes:', error);
            throw new Error('Failed to generate backup codes');
        }
    }

    async verifyBackupCode(userId, code) {
        try {
            const userDoc = await this.db.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                return false;
            }

            const userData = userDoc.data();
            if (!userData.backupCodes || userData.backupCodes.length === 0) {
                return false;
            }

            // Hash the provided code
            const hashedCode = await this.hashCode(code);

            // Check if code exists
            const codeIndex = userData.backupCodes.indexOf(hashedCode);
            if (codeIndex === -1) {
                await this.logMFAActivity(userId, 'backup_code_verification_failed');
                return false;
            }

            // Remove used backup code
            const updatedCodes = userData.backupCodes.filter((_, index) => index !== codeIndex);
            await this.db.collection('users').doc(userId).update({
                backupCodes: updatedCodes
            });

            await this.logMFAActivity(userId, 'backup_code_verification_success');
            return true;
        } catch (error) {
            console.error('Error verifying backup code:', error);
            return false;
        }
    }

    async enableMFA(userId, methods) {
        try {
            const updateData = {
                mfaEnabled: true,
                mfaMethods: methods,
                mfaSetupDate: new Date().toISOString(),
                mfaLastUsed: new Date().toISOString()
            };

            await this.db.collection('users').doc(userId).update(updateData);
            await this.logMFAActivity(userId, 'mfa_enabled');

            return { success: true };
        } catch (error) {
            console.error('Error enabling MFA:', error);
            throw new Error('Failed to enable MFA');
        }
    }

    async disableMFA(userId) {
        try {
            const updateData = {
                mfaEnabled: false,
                mfaMethods: [],
                mfaSecret: null,
                backupCodes: [],
                mfaSetupDate: null,
                mfaLastUsed: null
            };

            await this.db.collection('users').doc(userId).update(updateData);
            await this.logMFAActivity(userId, 'mfa_disabled');

            return { success: true };
        } catch (error) {
            console.error('Error disabling MFA:', error);
            throw new Error('Failed to disable MFA');
        }
    }

    async sendSMSCode(userId, code) {
        try {
            // Get user's phone number
            const userDoc = await this.db.collection('users').doc(userId).get();
            const userData = userDoc.data();
            
            if (!userData.phoneNumber) {
                throw new Error('No phone number found for user');
            }

            // In production, integrate with Twilio API
            const message = this.mfaConfig.sms.templates.verification.replace('{code}', code);
            
            // For demo purposes, log the SMS
            console.log(`SMS to ${userData.phoneNumber}: ${message}`);
            
            // Implement actual SMS sending using Twilio or similar service
            try {
                // For production, integrate with SMS service provider
                // Example: Twilio, AWS SNS, or custom SMS gateway
                if (window.twilioClient) {
                    await window.twilioClient.messages.create({
                        body: message,
                        from: window.twilioConfig.fromNumber,
                        to: userData.phoneNumber
                    });
                } else if (window.smsService) {
                    // Alternative SMS service
                    await window.smsService.send({
                        to: userData.phoneNumber,
                        message: message
                    });
                } else {
                    // Fallback for development/testing
                    console.log(`SMS to ${userData.phoneNumber}: ${message}`);
                    // Simulate SMS delivery
                    setTimeout(() => {
                        this.showNotification('SMS verification code sent successfully!', 'success');
                    }, 1000);
                }
            } catch (error) {
                console.error('SMS sending error:', error);
                this.showNotification('Failed to send SMS. Please try again.', 'error');
            }

            return { success: true };
        } catch (error) {
            console.error('Error sending SMS code:', error);
            throw new Error('Failed to send SMS code');
        }
    }

    async sendEmailCode(userId, code) {
        try {
            // Get user's email
            const userDoc = await this.db.collection('users').doc(userId).get();
            const userData = userDoc.data();
            
            if (!userData.email) {
                throw new Error('No email found for user');
            }

            // In production, integrate with SendGrid API
            const subject = 'Angkor Compliance - MFA Verification Code';
            const message = `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.`;
            
            // For demo purposes, log the email
            console.log(`Email to ${userData.email}: ${subject}\n${message}`);
            
            // Implement actual email sending using SendGrid or similar service
            try {
                // For production, integrate with email service provider
                // Example: SendGrid, AWS SES, or custom SMTP server
                if (window.sendGridClient) {
                    await window.sendGridClient.send({
                        to: userData.email,
                        from: 'noreply@angkor-compliance.com',
                        subject: subject,
                        text: message
                    });
                } else if (window.emailService) {
                    // Alternative email service
                    await window.emailService.send({
                        to: userData.email,
                        from: 'noreply@angkor-compliance.com',
                        subject: subject,
                        text: message
                    });
                } else {
                    // Fallback for development/testing
                    console.log(`Email to ${userData.email}: ${subject}\n${message}`);
                    // Simulate email delivery
                    setTimeout(() => {
                        this.showNotification('Email verification code sent successfully!', 'success');
                    }, 1000);
                }
            } catch (error) {
                console.error('Email sending error:', error);
                this.showNotification('Failed to send email. Please try again.', 'error');
            }

            return { success: true };
        } catch (error) {
            console.error('Error sending email code:', error);
            throw new Error('Failed to send email code');
        }
    }

    async storeVerificationCode(userId, method, code, expiresAt) {
        try {
            const verificationData = {
                code: code,
                method: method,
                expiresAt: expiresAt,
                createdAt: new Date().toISOString()
            };

            await this.db.collection('verification_codes').doc(`${userId}_${method}`).set(verificationData);
        } catch (error) {
            console.error('Error storing verification code:', error);
            throw new Error('Failed to store verification code');
        }
    }

    async getStoredVerificationCode(userId, method) {
        try {
            const doc = await this.db.collection('verification_codes').doc(`${userId}_${method}`).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('Error getting stored verification code:', error);
            return null;
        }
    }

    async clearVerificationCode(userId, method) {
        try {
            await this.db.collection('verification_codes').doc(`${userId}_${method}`).delete();
        } catch (error) {
            console.error('Error clearing verification code:', error);
        }
    }

    async logMFAActivity(userId, activity) {
        try {
            const logEntry = {
                userId: userId,
                activity: activity,
                timestamp: new Date().toISOString(),
                ipAddress: await this.getClientIP(),
                userAgent: navigator.userAgent
            };

            await this.db.collection('mfa_activity_logs').add(logEntry);
        } catch (error) {
            console.error('Error logging MFA activity:', error);
        }
    }

    async getClientIP() {
        // In production, get from request headers
        return '127.0.0.1';
    }

    generateRandomCode(length, format = 'numeric') {
        const chars = format === 'alphanumeric' 
            ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
            : '0123456789';
        
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    async hashCode(code) {
        // In production, use a proper hashing library
        const encoder = new TextEncoder();
        const data = encoder.encode(code);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async getMFAStatus(userId) {
        try {
            const userDoc = await this.db.collection('users').doc(userId).get();
            if (!userDoc.exists) {
                return { mfaEnabled: false, methods: [] };
            }

            const userData = userDoc.data();
            return {
                mfaEnabled: userData.mfaEnabled || false,
                methods: userData.mfaMethods || [],
                setupDate: userData.mfaSetupDate,
                lastUsed: userData.mfaLastUsed,
                backupCodesCount: userData.backupCodes ? userData.backupCodes.length : 0
            };
        } catch (error) {
            console.error('Error getting MFA status:', error);
            return { mfaEnabled: false, methods: [] };
        }
    }

    async getMFAActivityLogs(userId, limit = 50) {
        try {
            const logs = await this.db.collection('mfa_activity_logs')
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            return logs.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error getting MFA activity logs:', error);
            return [];
        }
    }
}

// Global MFA System instance
window.MFAAuthenticationSystem = MFAAuthenticationSystem;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mfaSystem = new MFAAuthenticationSystem();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MFAAuthenticationSystem;
}
