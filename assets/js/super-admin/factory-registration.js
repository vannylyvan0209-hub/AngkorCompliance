// Factory Registration System for Super Admin

class FactoryRegistration {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.formData = {};
        this.validationErrors = [];
    }

    async init() {
        try {
            await initializeFirebase();
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            await this.checkAuthentication();
            this.setupEventListeners();
            this.setupFormValidation();
        } catch (error) {
            console.error('Error initializing Factory Registration:', error);
            this.showError('Failed to initialize factory registration system');
        }
    }

    async checkAuthentication() {
        return new Promise((resolve, reject) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    try {
                        // Get user's role information
                        const userDoc = await this.db.collection('users').doc(user.uid).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            if (userData.role === 'super_admin') {
                                resolve();
                            } else {
                                reject(new Error('Access denied. Super admin role required.'));
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

    setupEventListeners() {
        // Form submission
        document.getElementById('factoryRegistrationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveFactory();
        });

        // Real-time form validation and preview updates
        const formInputs = document.querySelectorAll('#factoryRegistrationForm input, #factoryRegistrationForm select, #factoryRegistrationForm textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updatePreview();
            });
            input.addEventListener('change', () => {
                this.updatePreview();
            });
        });

        // Multi-select handling for compliance standards
        const complianceSelect = document.getElementById('complianceStandards');
        if (complianceSelect) {
            complianceSelect.addEventListener('change', () => {
                this.updatePreview();
            });
        }
    }

    setupFormValidation() {
        // Add custom validation for factory code uniqueness
        const factoryCodeInput = document.getElementById('factoryCode');
        if (factoryCodeInput) {
            factoryCodeInput.addEventListener('blur', async () => {
                await this.validateFactoryCode();
            });
        }
    }

    async validateFactoryCode() {
        const factoryCode = document.getElementById('factoryCode').value.trim();
        if (!factoryCode) return;

        try {
            const existingFactory = await this.db
                .collection('factories')
                .where('factoryCode', '==', factoryCode)
                .get();

            if (!existingFactory.empty) {
                this.showFieldError('factoryCode', 'Factory code already exists');
            } else {
                this.clearFieldError('factoryCode');
            }
        } catch (error) {
            console.error('Error validating factory code:', error);
        }
    }

    collectFormData() {
        const formData = {
            // Basic Information
            name: document.getElementById('factoryName').value.trim(),
            factoryCode: document.getElementById('factoryCode').value.trim(),
            industry: document.getElementById('industry').value,
            factoryType: document.getElementById('factoryType').value,
            description: document.getElementById('description').value.trim(),

            // Location & Contact
            country: document.getElementById('country').value,
            city: document.getElementById('city').value.trim(),
            address: document.getElementById('address').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            website: document.getElementById('website').value.trim(),
            timezone: document.getElementById('timezone').value,

            // Management & Staff
            ownerName: document.getElementById('ownerName').value.trim(),
            ownerEmail: document.getElementById('ownerEmail').value.trim(),
            managerName: document.getElementById('managerName').value.trim(),
            managerEmail: document.getElementById('managerEmail').value.trim(),
            employeeCount: parseInt(document.getElementById('employeeCount').value) || 0,
            shiftCount: document.getElementById('shiftCount').value,

            // Compliance & Standards
            complianceStandards: this.getSelectedComplianceStandards(),
            auditFrequency: document.getElementById('auditFrequency').value,
            hasGrievanceSystem: document.getElementById('hasGrievanceSystem').checked,
            hasWorkerCommittee: document.getElementById('hasWorkerCommittee').checked,
            hasSafetyProgram: document.getElementById('hasSafetyProgram').checked,
            hasTrainingProgram: document.getElementById('hasTrainingProgram').checked,

            // System Configuration
            subscriptionPlan: document.getElementById('subscriptionPlan').value,
            maxUsers: parseInt(document.getElementById('maxUsers').value) || 10,
            enableAI: document.getElementById('enableAI').checked,
            enableAnalytics: document.getElementById('enableAnalytics').checked,
            enableMultiLanguage: document.getElementById('enableMultiLanguage').checked,
            enableAPI: document.getElementById('enableAPI').checked
        };

        return formData;
    }

    getSelectedComplianceStandards() {
        const select = document.getElementById('complianceStandards');
        const selectedOptions = Array.from(select.selectedOptions).map(option => option.value);
        return selectedOptions;
    }

    validateFormData(formData) {
        this.validationErrors = [];

        // Required fields validation
        const requiredFields = [
            'name', 'factoryCode', 'industry', 'factoryType', 'country', 'city', 
            'address', 'phone', 'email', 'timezone', 'ownerName', 'ownerEmail', 
            'managerName', 'managerEmail', 'employeeCount', 'shiftCount', 'subscriptionPlan'
        ];

        requiredFields.forEach(field => {
            if (!formData[field]) {
                this.validationErrors.push(`${this.getFieldLabel(field)} is required`);
            }
        });

        // Email validation
        if (formData.email && !this.isValidEmail(formData.email)) {
            this.validationErrors.push('Invalid email format');
        }

        if (formData.ownerEmail && !this.isValidEmail(formData.ownerEmail)) {
            this.validationErrors.push('Invalid owner email format');
        }

        if (formData.managerEmail && !this.isValidEmail(formData.managerEmail)) {
            this.validationErrors.push('Invalid manager email format');
        }

        // Phone validation
        if (formData.phone && !this.isValidPhone(formData.phone)) {
            this.validationErrors.push('Invalid phone number format');
        }

        // Employee count validation
        if (formData.employeeCount <= 0) {
            this.validationErrors.push('Employee count must be greater than 0');
        }

        // Website validation
        if (formData.website && !this.isValidUrl(formData.website)) {
            this.validationErrors.push('Invalid website URL format');
        }

        return this.validationErrors.length === 0;
    }

    getFieldLabel(field) {
        const labels = {
            'name': 'Factory Name',
            'factoryCode': 'Factory Code',
            'industry': 'Industry',
            'factoryType': 'Factory Type',
            'country': 'Country',
            'city': 'City',
            'address': 'Address',
            'phone': 'Phone Number',
            'email': 'Email Address',
            'timezone': 'Timezone',
            'ownerName': 'Owner/CEO Name',
            'ownerEmail': 'Owner/CEO Email',
            'managerName': 'Factory Manager Name',
            'managerEmail': 'Factory Manager Email',
            'employeeCount': 'Number of Employees',
            'shiftCount': 'Number of Shifts',
            'subscriptionPlan': 'Subscription Plan'
        };
        return labels[field] || field;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    async saveFactory() {
        try {
            const formData = this.collectFormData();
            
            if (!this.validateFormData(formData)) {
                this.showValidationErrors();
                return;
            }

            this.showLoading();

            // Check if factory code already exists
            const existingFactory = await this.db
                .collection('factories')
                .where('factoryCode', '==', formData.factoryCode)
                .get();

            if (!existingFactory.empty) {
                this.showError('Factory code already exists. Please choose a different code.');
                return;
            }

            // Create factory document
            const factoryData = {
                ...formData,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: this.currentUser.uid,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: this.currentUser.uid
            };

            const factoryRef = await this.db.collection('factories').add(factoryData);

            // Create factory admin user
            await this.createFactoryAdminUser(factoryData, factoryRef.id);

            // Send welcome emails
            await this.sendWelcomeEmails(factoryData);

            this.showSuccess('Factory registered successfully!');
            this.resetForm();

        } catch (error) {
            console.error('Error saving factory:', error);
            this.showError('Failed to register factory');
        } finally {
            this.hideLoading();
        }
    }

    async createFactoryAdminUser(factoryData, factoryId) {
        try {
            // Create factory admin user account
            const adminUserData = {
                firstName: factoryData.managerName.split(' ')[0] || 'Factory',
                lastName: factoryData.managerName.split(' ').slice(1).join(' ') || 'Admin',
                email: factoryData.managerEmail,
                role: 'factory_admin',
                factoryId: factoryId,
                status: 'active',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: this.currentUser.uid
            };

            await this.db.collection('users').add(adminUserData);

            // Create invitation for factory admin
            const invitationData = {
                ...adminUserData,
                invitedBy: this.currentUser.uid,
                invitedAt: firebase.firestore.FieldValue.serverTimestamp(),
                invitationToken: this.generateInvitationToken(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            };

            await this.db.collection('user_invitations').add(invitationData);

        } catch (error) {
            console.error('Error creating factory admin user:', error);
        }
    }

    async sendWelcomeEmails(factoryData) {
        try {
            // Send welcome email to factory manager
            await this.sendEmail({
                to: factoryData.managerEmail,
                subject: 'Welcome to Angkor Compliance Platform',
                template: 'factory_welcome',
                data: {
                    factoryName: factoryData.name,
                    managerName: factoryData.managerName,
                    loginUrl: `${window.location.origin}/login`
                }
            });

            // Send notification to owner
            if (factoryData.ownerEmail && factoryData.ownerEmail !== factoryData.managerEmail) {
                await this.sendEmail({
                    to: factoryData.ownerEmail,
                    subject: 'Factory Registration Confirmation',
                    template: 'factory_owner_notification',
                    data: {
                        factoryName: factoryData.name,
                        ownerName: factoryData.ownerName,
                        managerName: factoryData.managerName
                    }
                });
            }

        } catch (error) {
            console.error('Error sending welcome emails:', error);
        }
    }

    async sendEmail(emailData) {
        // In a real application, this would be handled by a backend service
        // For now, we'll just log the email
        console.log('Email would be sent:', emailData);
        
        // Store email in Firestore for tracking
        await this.db.collection('email_logs').add({
            ...emailData,
            sentAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'sent'
        });
    }

    generateInvitationToken() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    updatePreview() {
        const formData = this.collectFormData();
        const previewContent = document.getElementById('previewContent');
        
        if (!formData.name) {
            previewContent.innerHTML = `
                <div class="empty-preview">
                    <i data-lucide="building"></i>
                    <h3>Factory Preview</h3>
                    <p>Fill out the form to see a preview of the factory card</p>
                </div>
            `;
            return;
        }

        const factoryCard = this.generateFactoryCard(formData);
        previewContent.innerHTML = factoryCard;

        // Recreate icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    generateFactoryCard(formData) {
        const initials = this.getInitials(formData.name);
        const industryName = this.getIndustryName(formData.industry);
        const countryName = this.getCountryName(formData.country);

        return `
            <div class="factory-card">
                <div class="factory-header">
                    <div class="factory-logo">${initials}</div>
                    <div class="factory-info">
                        <h3>${formData.name}</h3>
                        <p>${industryName} • ${countryName}</p>
                    </div>
                </div>
                
                <div class="factory-details">
                    <div class="detail-item">
                        <div class="detail-label">Factory Code</div>
                        <div class="detail-value">${formData.factoryCode}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Type</div>
                        <div class="detail-value">${formData.factoryType}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Employees</div>
                        <div class="detail-value">${formData.employeeCount}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Shifts</div>
                        <div class="detail-value">${formData.shiftCount}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Location</div>
                        <div class="detail-value">${formData.city}, ${countryName}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Manager</div>
                        <div class="detail-value">${formData.managerName}</div>
                    </div>
                </div>

                <div class="factory-status">
                    <span class="status-badge status-pending">Pending Activation</span>
                    <span class="status-badge status-active">Subscription: ${formData.subscriptionPlan}</span>
                </div>

                <div class="compliance-info">
                    <div class="compliance-item">
                        <span class="compliance-label">Grievance System</span>
                        <span class="compliance-value ${formData.hasGrievanceSystem ? 'compliant' : 'non-compliant'}">
                            ${formData.hasGrievanceSystem ? 'Yes' : 'No'}
                        </span>
                    </div>
                    <div class="compliance-item">
                        <span class="compliance-label">Worker Committee</span>
                        <span class="compliance-value ${formData.hasWorkerCommittee ? 'compliant' : 'non-compliant'}">
                            ${formData.hasWorkerCommittee ? 'Yes' : 'No'}
                        </span>
                    </div>
                    <div class="compliance-item">
                        <span class="compliance-label">Safety Program</span>
                        <span class="compliance-value ${formData.hasSafetyProgram ? 'compliant' : 'non-compliant'}">
                            ${formData.hasSafetyProgram ? 'Yes' : 'No'}
                        </span>
                    </div>
                    <div class="compliance-item">
                        <span class="compliance-label">Training Program</span>
                        <span class="compliance-value ${formData.hasTrainingProgram ? 'compliant' : 'non-compliant'}">
                            ${formData.hasTrainingProgram ? 'Yes' : 'No'}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    getInitials(name) {
        return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2);
    }

    getIndustryName(industry) {
        const industries = {
            'textiles': 'Textiles & Apparel',
            'electronics': 'Electronics',
            'automotive': 'Automotive',
            'food': 'Food & Beverage',
            'chemicals': 'Chemicals',
            'pharmaceuticals': 'Pharmaceuticals',
            'construction': 'Construction',
            'other': 'Other'
        };
        return industries[industry] || industry;
    }

    getCountryName(country) {
        const countries = {
            'cambodia': 'Cambodia',
            'thailand': 'Thailand',
            'vietnam': 'Vietnam',
            'laos': 'Laos',
            'myanmar': 'Myanmar',
            'malaysia': 'Malaysia',
            'indonesia': 'Indonesia',
            'philippines': 'Philippines'
        };
        return countries[country] || country;
    }

    showValidationErrors() {
        const errorContainer = document.getElementById('validationErrors');
        const errorList = document.getElementById('errorList');
        
        errorList.innerHTML = this.validationErrors.map(error => `<li>${error}</li>`).join('');
        errorContainer.classList.add('show');
        
        // Hide success message if visible
        document.getElementById('successMessage').classList.remove('show');
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.style.borderColor = 'var(--error-color)';
            // Add error message below field if needed
        }
    }

    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.style.borderColor = 'var(--border-color)';
        }
    }

    resetForm() {
        document.getElementById('factoryRegistrationForm').reset();
        this.updatePreview();
        this.hideValidationErrors();
        this.hideSuccessMessage();
    }

    hideValidationErrors() {
        document.getElementById('validationErrors').classList.remove('show');
    }

    hideSuccessMessage() {
        document.getElementById('successMessage').classList.remove('show');
    }

    showLoading() {
        // Add loading indicator
        const saveButton = document.querySelector('button[type="submit"]');
        if (saveButton) {
            saveButton.disabled = true;
            saveButton.innerHTML = '<i data-lucide="loader-2"></i> Saving...';
        }
    }

    hideLoading() {
        // Remove loading indicator
        const saveButton = document.querySelector('button[type="submit"]');
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerHTML = '<i data-lucide="save"></i> Register Factory';
        }
    }

    showSuccess(message) {
        document.getElementById('successMessage').classList.add('show');
        this.hideValidationErrors();
    }

    showError(message) {
        alert('Error: ' + message); // Replace with proper notification system
    }
}

// Global functions for button actions
let factoryRegistration;

function saveFactory() {
    factoryRegistration.saveFactory();
}

function resetForm() {
    factoryRegistration.resetForm();
}

function previewFactory() {
    factoryRegistration.updatePreview();
}

function refreshPreview() {
    factoryRegistration.updatePreview();
}

function loadExistingFactories() {
    // Navigate to factory management page
    alert('Navigate to factory management page - to be implemented');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    factoryRegistration = new FactoryRegistration();
    window.factoryRegistration = factoryRegistration;
    factoryRegistration.init();
});
