// MFA Setup JavaScript - Angkor Compliance Platform

class MFASetup {
    constructor() {
        this.mfaSystem = window.mfaSystem;
        this.currentUser = null;
        this.currentMethod = null;
        this.setupData = {};
        
        this.initializeSetup();
    }

    async initializeSetup() {
        try {
            // Get current user (in production, this would come from authentication)
            this.currentUser = await this.getCurrentUser();
            
            if (!this.currentUser) {
                this.showError('User not authenticated. Please log in.');
                return;
            }
            
            // Load MFA status
            await this.loadMFAStatus();
            
            // Set up event listeners
            this.setupEventListeners();
            
            console.log('✅ MFA Setup initialized');
        } catch (error) {
            console.error('❌ Error initializing MFA Setup:', error);
            this.showError('Failed to initialize MFA setup. Please refresh the page.');
        }
    }

    async getCurrentUser() {
        // In production, this would get the authenticated user
        // For demo purposes, return a mock user
        return {
            id: 'demo-user-123',
            email: 'demo@angkor-compliance.com',
            phoneNumber: '+855 12 345 678',
            name: 'Demo User'
        };
    }

    async loadMFAStatus() {
        try {
            this.showLoading();
            
            const status = await this.mfaSystem.getMFAStatus(this.currentUser.id);
            
            this.updateStatusDisplay(status);
            this.updateMethodStatuses(status);
            
            this.hideLoading();
        } catch (error) {
            console.error('Error loading MFA status:', error);
            this.hideLoading();
            this.showError('Failed to load MFA status.');
        }
    }

    updateStatusDisplay(status) {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusIndicator').querySelector('.status-text');
        const statusDot = document.getElementById('statusIndicator').querySelector('.status-dot');
        const statusDetails = document.getElementById('statusDetails');
        
        // Update status indicator
        if (status.mfaEnabled) {
            statusDot.className = 'status-dot enabled';
            statusText.textContent = 'MFA Enabled';
        } else {
            statusDot.className = 'status-dot disabled';
            statusText.textContent = 'MFA Disabled';
        }
        
        // Update status details
        statusDetails.innerHTML = `
            <div class="status-item">
                <h4>Methods Enabled</h4>
                <p>${status.methods.length}</p>
            </div>
            <div class="status-item">
                <h4>Setup Date</h4>
                <p>${status.setupDate ? new Date(status.setupDate).toLocaleDateString() : 'Not set up'}</p>
            </div>
            <div class="status-item">
                <h4>Last Used</h4>
                <p>${status.lastUsed ? new Date(status.lastUsed).toLocaleDateString() : 'Never'}</p>
            </div>
            <div class="status-item">
                <h4>Backup Codes</h4>
                <p>${status.backupCodesCount} remaining</p>
            </div>
        `;
    }

    updateMethodStatuses(status) {
        const methods = ['totp', 'sms', 'email', 'backup'];
        
        methods.forEach(method => {
            const statusElement = document.getElementById(`${method}Status`);
            const setupBtn = document.getElementById(`${method}SetupBtn`);
            const disableBtn = document.getElementById(`${method}DisableBtn`);
            
            if (status.methods.includes(method)) {
                statusElement.textContent = 'Enabled';
                statusElement.className = 'status-badge enabled';
                setupBtn.style.display = 'none';
                disableBtn.style.display = 'inline-flex';
            } else {
                statusElement.textContent = 'Not Set Up';
                statusElement.className = 'status-badge not-setup';
                setupBtn.style.display = 'inline-flex';
                disableBtn.style.display = 'none';
            }
        });
    }

    setupEventListeners() {
        // Add input validation for verification codes
        const codeInputs = document.querySelectorAll('input[pattern="[0-9]{6}"]');
        codeInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
            });
        });
        
        // Add phone number formatting
        const phoneInput = document.getElementById('smsPhone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        }
    }

    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value.length <= 3) {
                value = `+${value}`;
            } else if (value.length <= 6) {
                value = `+${value.slice(0, 3)} ${value.slice(3)}`;
            } else if (value.length <= 9) {
                value = `+${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`;
            } else {
                value = `+${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 9)} ${value.slice(9, 12)}`;
            }
        }
        
        input.value = value;
    }

    // TOTP Setup Functions
    async setupTOTP() {
        try {
            this.showLoading();
            this.currentMethod = 'totp';
            
            const totpData = await this.mfaSystem.generateTOTPSecret(this.currentUser.id, this.currentUser.email);
            this.setupData.totp = totpData;
            
            // Generate QR code
            await this.generateQRCode(totpData.qrCode);
            
            // Update secret display
            document.getElementById('totpSecret').textContent = totpData.secret;
            
            // Show TOTP content
            document.getElementById('totpContent').style.display = 'block';
            
            this.hideLoading();
        } catch (error) {
            console.error('Error setting up TOTP:', error);
            this.hideLoading();
            this.showError('Failed to set up TOTP. Please try again.');
        }
    }

    async generateQRCode(qrCodeUrl) {
        const qrContainer = document.getElementById('qrContainer');
        qrContainer.innerHTML = '';
        
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrContainer, {
                text: qrCodeUrl,
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            qrContainer.innerHTML = `
                <div style="text-align: center; color: #7f8c8d;">
                    <i class="fas fa-qrcode" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>QR Code generation not available</p>
                    <p>Please use manual entry</p>
                </div>
            `;
        }
    }

    async verifyTOTP() {
        try {
            const code = document.getElementById('totpCode').value;
            
            if (!code || code.length !== 6) {
                this.showError('Please enter a valid 6-digit code.');
                return;
            }
            
            this.showLoading();
            
            const verified = await this.mfaSystem.verifyTOTPCode(this.currentUser.id, code);
            
            if (verified) {
                await this.enableMFAMethod('totp');
                this.showSuccess('TOTP authentication has been set up successfully!');
            } else {
                this.showError('Invalid verification code. Please try again.');
            }
            
            this.hideLoading();
        } catch (error) {
            console.error('Error verifying TOTP:', error);
            this.hideLoading();
            this.showError('Failed to verify TOTP code. Please try again.');
        }
    }

    async disableTOTP() {
        try {
            this.showLoading();
            
            await this.disableMFAMethod('totp');
            this.showSuccess('TOTP authentication has been disabled.');
            
            this.hideLoading();
        } catch (error) {
            console.error('Error disabling TOTP:', error);
            this.hideLoading();
            this.showError('Failed to disable TOTP. Please try again.');
        }
    }

    // SMS Setup Functions
    async setupSMS() {
        try {
            this.currentMethod = 'sms';
            document.getElementById('smsContent').style.display = 'block';
        } catch (error) {
            console.error('Error setting up SMS:', error);
            this.showError('Failed to set up SMS verification.');
        }
    }

    async sendSMSCode() {
        try {
            const phoneNumber = document.getElementById('smsPhone').value;
            
            if (!phoneNumber) {
                this.showError('Please enter a valid phone number.');
                return;
            }
            
            this.showLoading();
            
            await this.mfaSystem.generateVerificationCode(this.currentUser.id, 'sms');
            
            this.showSuccess('Verification code sent to your phone number.');
            this.hideLoading();
        } catch (error) {
            console.error('Error sending SMS code:', error);
            this.hideLoading();
            this.showError('Failed to send SMS code. Please try again.');
        }
    }

    async verifySMSCode() {
        try {
            const code = document.getElementById('smsCode').value;
            
            if (!code || code.length !== 6) {
                this.showError('Please enter a valid 6-digit code.');
                return;
            }
            
            this.showLoading();
            
            const verified = await this.mfaSystem.verifyCode(this.currentUser.id, 'sms', code);
            
            if (verified) {
                await this.enableMFAMethod('sms');
                this.showSuccess('SMS verification has been set up successfully!');
            } else {
                this.showError('Invalid verification code. Please try again.');
            }
            
            this.hideLoading();
        } catch (error) {
            console.error('Error verifying SMS code:', error);
            this.hideLoading();
            this.showError('Failed to verify SMS code. Please try again.');
        }
    }

    async disableSMS() {
        try {
            this.showLoading();
            
            await this.disableMFAMethod('sms');
            this.showSuccess('SMS verification has been disabled.');
            
            this.hideLoading();
        } catch (error) {
            console.error('Error disabling SMS:', error);
            this.hideLoading();
            this.showError('Failed to disable SMS verification. Please try again.');
        }
    }

    // Email Setup Functions
    async setupEmail() {
        try {
            this.currentMethod = 'email';
            
            // Set user email
            document.getElementById('userEmail').textContent = this.currentUser.email;
            
            document.getElementById('emailContent').style.display = 'block';
        } catch (error) {
            console.error('Error setting up email:', error);
            this.showError('Failed to set up email verification.');
        }
    }

    async sendEmailCode() {
        try {
            this.showLoading();
            
            await this.mfaSystem.generateVerificationCode(this.currentUser.id, 'email');
            
            this.showSuccess('Verification code sent to your email address.');
            this.hideLoading();
        } catch (error) {
            console.error('Error sending email code:', error);
            this.hideLoading();
            this.showError('Failed to send email code. Please try again.');
        }
    }

    async verifyEmailCode() {
        try {
            const code = document.getElementById('emailCode').value;
            
            if (!code || code.length !== 6) {
                this.showError('Please enter a valid 6-digit code.');
                return;
            }
            
            this.showLoading();
            
            const verified = await this.mfaSystem.verifyCode(this.currentUser.id, 'email', code);
            
            if (verified) {
                await this.enableMFAMethod('email');
                this.showSuccess('Email verification has been set up successfully!');
            } else {
                this.showError('Invalid verification code. Please try again.');
            }
            
            this.hideLoading();
        } catch (error) {
            console.error('Error verifying email code:', error);
            this.hideLoading();
            this.showError('Failed to verify email code. Please try again.');
        }
    }

    async disableEmail() {
        try {
            this.showLoading();
            
            await this.disableMFAMethod('email');
            this.showSuccess('Email verification has been disabled.');
            
            this.hideLoading();
        } catch (error) {
            console.error('Error disabling email:', error);
            this.hideLoading();
            this.showError('Failed to disable email verification. Please try again.');
        }
    }

    // Backup Codes Functions
    async setupBackupCodes() {
        try {
            this.showLoading();
            
            const backupCodes = await this.mfaSystem.generateBackupCodes(this.currentUser.id);
            this.setupData.backupCodes = backupCodes;
            
            this.displayBackupCodes(backupCodes);
            document.getElementById('backupContent').style.display = 'block';
            
            this.hideLoading();
        } catch (error) {
            console.error('Error generating backup codes:', error);
            this.hideLoading();
            this.showError('Failed to generate backup codes. Please try again.');
        }
    }

    displayBackupCodes(codes) {
        const codesGrid = document.getElementById('backupCodesGrid');
        codesGrid.innerHTML = '';
        
        codes.forEach(code => {
            const codeItem = document.createElement('div');
            codeItem.className = 'code-item';
            codeItem.textContent = code;
            codesGrid.appendChild(codeItem);
        });
    }

    async regenerateBackupCodes() {
        try {
            this.showLoading();
            
            const backupCodes = await this.mfaSystem.generateBackupCodes(this.currentUser.id);
            this.setupData.backupCodes = backupCodes;
            
            this.displayBackupCodes(backupCodes);
            this.showSuccess('New backup codes have been generated successfully!');
            
            this.hideLoading();
        } catch (error) {
            console.error('Error regenerating backup codes:', error);
            this.hideLoading();
            this.showError('Failed to regenerate backup codes. Please try again.');
        }
    }

    downloadBackupCodes() {
        if (!this.setupData.backupCodes) {
            this.showError('No backup codes available to download.');
            return;
        }
        
        const codes = this.setupData.backupCodes.join('\n');
        const blob = new Blob([codes], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'angkor-compliance-backup-codes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccess('Backup codes downloaded successfully!');
    }

    printBackupCodes() {
        if (!this.setupData.backupCodes) {
            this.showError('No backup codes available to print.');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        const codes = this.setupData.backupCodes.join('\n');
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Angkor Compliance - Backup Codes</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .codes { font-family: 'Courier New', monospace; font-size: 16px; line-height: 2; }
                        .warning { color: red; font-weight: bold; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Angkor Compliance - Backup Codes</h1>
                        <p>Generated on ${new Date().toLocaleString()}</p>
                    </div>
                    <div class="codes">
                        ${this.setupData.backupCodes.map(code => `<div>${code}</div>`).join('')}
                    </div>
                    <div class="warning">
                        <p>⚠️ Keep these codes secure. Each code can only be used once.</p>
                    </div>
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }

    // Helper Functions
    async enableMFAMethod(method) {
        try {
            const currentStatus = await this.mfaSystem.getMFAStatus(this.currentUser.id);
            const methods = [...currentStatus.methods, method];
            
            await this.mfaSystem.enableMFA(this.currentUser.id, methods);
            
            // Reload status
            await this.loadMFAStatus();
            
            // Hide setup content
            document.getElementById(`${method}Content`).style.display = 'none';
            
            // Clear form data
            this.clearFormData(method);
        } catch (error) {
            console.error('Error enabling MFA method:', error);
            throw error;
        }
    }

    async disableMFAMethod(method) {
        try {
            const currentStatus = await this.mfaSystem.getMFAStatus(this.currentUser.id);
            const methods = currentStatus.methods.filter(m => m !== method);
            
            if (methods.length === 0) {
                await this.mfaSystem.disableMFA(this.currentUser.id);
            } else {
                await this.mfaSystem.enableMFA(this.currentUser.id, methods);
            }
            
            // Reload status
            await this.loadMFAStatus();
            
            // Hide setup content
            document.getElementById(`${method}Content`).style.display = 'none';
            
            // Clear form data
            this.clearFormData(method);
        } catch (error) {
            console.error('Error disabling MFA method:', error);
            throw error;
        }
    }

    clearFormData(method) {
        const inputs = document.querySelectorAll(`#${method}Content input`);
        inputs.forEach(input => {
            input.value = '';
        });
    }

    // Utility Functions
    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showSuccess(message) {
        document.getElementById('successMessage').textContent = message;
        document.getElementById('successModal').style.display = 'flex';
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorModal').style.display = 'flex';
    }

    closeSuccessModal() {
        document.getElementById('successModal').style.display = 'none';
    }

    closeErrorModal() {
        document.getElementById('errorModal').style.display = 'none';
    }

    retrySetup() {
        this.closeErrorModal();
        if (this.currentMethod) {
            this[`setup${this.currentMethod.toUpperCase()}`]();
        }
    }
}

// Global functions for HTML onclick handlers
function setupTOTP() {
    window.mfaSetup.setupTOTP();
}

function verifyTOTP() {
    window.mfaSetup.verifyTOTP();
}

function disableTOTP() {
    window.mfaSetup.disableTOTP();
}

function setupSMS() {
    window.mfaSetup.setupSMS();
}

function sendSMSCode() {
    window.mfaSetup.sendSMSCode();
}

function verifySMSCode() {
    window.mfaSetup.verifySMSCode();
}

function disableSMS() {
    window.mfaSetup.disableSMS();
}

function setupEmail() {
    window.mfaSetup.setupEmail();
}

function sendEmailCode() {
    window.mfaSetup.sendEmailCode();
}

function verifyEmailCode() {
    window.mfaSetup.verifyEmailCode();
}

function disableEmail() {
    window.mfaSetup.disableEmail();
}

function setupBackupCodes() {
    window.mfaSetup.setupBackupCodes();
}

function regenerateBackupCodes() {
    window.mfaSetup.regenerateBackupCodes();
}

function downloadBackupCodes() {
    window.mfaSetup.downloadBackupCodes();
}

function printBackupCodes() {
    window.mfaSetup.printBackupCodes();
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        // Show a brief success message
        const originalText = element.textContent;
        element.textContent = 'Copied!';
        element.style.color = '#27ae60';
        
        setTimeout(() => {
            element.textContent = originalText;
            element.style.color = '#2c3e50';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        window.mfaSetup.showError('Failed to copy to clipboard.');
    });
}

function closeSuccessModal() {
    window.mfaSetup.closeSuccessModal();
}

function closeErrorModal() {
    window.mfaSetup.closeErrorModal();
}

function retrySetup() {
    window.mfaSetup.retrySetup();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mfaSetup = new MFASetup();
});
