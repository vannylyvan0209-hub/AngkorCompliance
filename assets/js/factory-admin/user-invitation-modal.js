import { initializeFirebase } from '../../firebase-config.js';

class UserInvitationModal {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.currentFactory = null;
        this.roleTemplates = {};
        this.invitationDraft = null;
    }

    async init() {
        try {
            await initializeFirebase();
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            await this.checkAuthentication();
            this.setupEventListeners();
            this.initializeRoleTemplates();
            this.loadInvitationDraft();
        } catch (error) {
            console.error('Error initializing User Invitation Modal:', error);
            this.showError('Failed to initialize invitation modal');
        }
    }

    async checkAuthentication() {
        return new Promise((resolve, reject) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    try {
                        // Get user's role and factory information
                        const userDoc = await this.db.collection('users').doc(user.uid).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            if (userData.role === 'factory_admin' || userData.role === 'super_admin') {
                                this.currentFactory = userData.factoryId;
                                resolve();
                            } else {
                                reject(new Error('Access denied. Factory admin role required.'));
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
        document.getElementById('invitationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendInvitation();
        });

        // Role change handler
        document.getElementById('userRole').addEventListener('change', (e) => {
            this.applyRolePermissions(e.target.value);
        });

        // Auto-save draft
        const formInputs = document.querySelectorAll('#invitationForm input, #invitationForm select, #invitationForm textarea');
        formInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.autoSaveDraft();
            });
        });
    }

    initializeRoleTemplates() {
        this.roleTemplates = {
            factory_admin: {
                name: 'Factory Administrator',
                permissions: {
                    permViewDocuments: true,
                    permUploadDocuments: true,
                    permApproveDocuments: true,
                    permViewCompliance: true,
                    permManageCAPs: true,
                    permViewAudits: true,
                    permViewUsers: true,
                    permInviteUsers: true,
                    permManageRoles: true,
                    permViewReports: true,
                    permExportData: true,
                    permViewAnalytics: true
                }
            },
            compliance_manager: {
                name: 'Compliance Manager',
                permissions: {
                    permViewDocuments: true,
                    permUploadDocuments: true,
                    permApproveDocuments: true,
                    permViewCompliance: true,
                    permManageCAPs: true,
                    permViewAudits: true,
                    permViewUsers: false,
                    permInviteUsers: false,
                    permManageRoles: false,
                    permViewReports: true,
                    permExportData: true,
                    permViewAnalytics: true
                }
            },
            hr_manager: {
                name: 'HR Manager',
                permissions: {
                    permViewDocuments: true,
                    permUploadDocuments: true,
                    permApproveDocuments: false,
                    permViewCompliance: true,
                    permManageCAPs: false,
                    permViewAudits: true,
                    permViewUsers: true,
                    permInviteUsers: true,
                    permManageRoles: false,
                    permViewReports: true,
                    permExportData: true,
                    permViewAnalytics: true
                }
            },
            supervisor: {
                name: 'Supervisor',
                permissions: {
                    permViewDocuments: true,
                    permUploadDocuments: true,
                    permApproveDocuments: false,
                    permViewCompliance: true,
                    permManageCAPs: false,
                    permViewAudits: false,
                    permViewUsers: false,
                    permInviteUsers: false,
                    permManageRoles: false,
                    permViewReports: true,
                    permExportData: false,
                    permViewAnalytics: false
                }
            },
            worker: {
                name: 'Worker',
                permissions: {
                    permViewDocuments: true,
                    permUploadDocuments: false,
                    permApproveDocuments: false,
                    permViewCompliance: false,
                    permManageCAPs: false,
                    permViewAudits: false,
                    permViewUsers: false,
                    permInviteUsers: false,
                    permManageRoles: false,
                    permViewReports: false,
                    permExportData: false,
                    permViewAnalytics: false
                }
            },
            viewer: {
                name: 'Viewer',
                permissions: {
                    permViewDocuments: true,
                    permUploadDocuments: false,
                    permApproveDocuments: false,
                    permViewCompliance: true,
                    permManageCAPs: false,
                    permViewAudits: true,
                    permViewUsers: false,
                    permInviteUsers: false,
                    permManageRoles: false,
                    permViewReports: true,
                    permExportData: false,
                    permViewAnalytics: false
                }
            }
        };
    }

    applyRolePermissions(role) {
        const template = this.roleTemplates[role];
        if (!template) return;

        // Apply permissions from template
        Object.keys(template.permissions).forEach(permissionId => {
            const checkbox = document.getElementById(permissionId);
            if (checkbox) {
                checkbox.checked = template.permissions[permissionId];
            }
        });

        // Update role name display
        const roleSelect = document.getElementById('userRole');
        const selectedOption = roleSelect.options[roleSelect.selectedIndex];
        if (selectedOption) {
            selectedOption.text = template.name;
        }
    }

    async sendInvitation() {
        try {
            this.showLoading('Sending invitation...');

            const formData = this.collectFormData();
            
            if (!this.validateFormData(formData)) {
                this.hideLoading();
                return;
            }

            // Create invitation record
            const invitationData = {
                ...formData,
                factoryId: this.currentFactory,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: this.currentUser.uid,
                expiresAt: this.calculateExpiryDate(parseInt(formData.expiryDays)),
                invitationToken: this.generateInvitationToken()
            };

            const invitationRef = await this.db.collection('user_invitations').add(invitationData);

            // Send invitation email
            await this.sendInvitationEmail(invitationData, invitationRef.id);

            // Update invitation status
            await this.db.collection('user_invitations').doc(invitationRef.id).update({
                emailSent: true,
                emailSentAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.hideLoading();
            this.showSuccess('Invitation sent successfully');
            this.resetForm();

        } catch (error) {
            console.error('Error sending invitation:', error);
            this.hideLoading();
            this.showError('Failed to send invitation');
        }
    }

    async sendBulkInvitations() {
        try {
            const emails = document.getElementById('bulkEmails').value.split('\n').filter(email => email.trim());
            const defaultRole = document.getElementById('bulkRole').value;
            const defaultDepartment = document.getElementById('bulkDepartment').value;

            if (emails.length === 0) {
                this.showError('Please enter at least one email address');
                return;
            }

            this.showLoading(`Sending ${emails.length} invitations...`);

            const invitations = [];
            for (const email of emails) {
                const invitationData = {
                    email: email.trim(),
                    firstName: '',
                    lastName: '',
                    phone: '',
                    userRole: defaultRole,
                    department: defaultDepartment,
                    position: '',
                    permissions: this.roleTemplates[defaultRole]?.permissions || {},
                    factoryId: this.currentFactory,
                    status: 'pending',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    createdBy: this.currentUser.uid,
                    expiresAt: this.calculateExpiryDate(14),
                    invitationToken: this.generateInvitationToken(),
                    isBulkInvitation: true
                };

                const invitationRef = await this.db.collection('user_invitations').add(invitationData);
                invitations.push(invitationRef.id);
            }

            this.hideLoading();
            this.showSuccess(`Successfully sent ${invitations.length} invitations`);
            this.closeModal('bulkInvitationModal');

        } catch (error) {
            console.error('Error sending bulk invitations:', error);
            this.hideLoading();
            this.showError('Failed to send bulk invitations');
        }
    }

    async sendInvitationEmail(invitationData, invitationId) {
        // In a real implementation, this would integrate with an email service
        // For now, we'll simulate the email sending
        console.log('Sending invitation email to:', invitationData.email);
        
        const emailContent = this.generateEmailContent(invitationData, invitationId);
        console.log('Email content:', emailContent);
    }

    generateEmailContent(invitationData, invitationId) {
        const invitationLink = `${window.location.origin}/invite?token=${invitationData.invitationToken}`;
        
        return `
            <h2>You're invited to join Angkor Compliance Platform</h2>
            <p>Hello ${invitationData.firstName},</p>
            <p>You have been invited to join our compliance platform as a ${this.getRoleDisplayName(invitationData.userRole)}.</p>
            <p><strong>Factory:</strong> ${this.currentFactory}</p>
            <p><strong>Department:</strong> ${invitationData.department || 'Not specified'}</p>
            <p><strong>Position:</strong> ${invitationData.position || 'Not specified'}</p>
            <p>Click the link below to accept the invitation and set up your account:</p>
            <p><a href="${invitationLink}">Accept Invitation</a></p>
            <p>This invitation will expire on ${invitationData.expiresAt.toDate().toLocaleDateString()}.</p>
            <p>If you have any questions, please contact your factory administrator.</p>
            <p>Best regards,<br>Angkor Compliance Team</p>
        `;
    }

    previewInvitation() {
        const formData = this.collectFormData();
        
        if (!formData.email) {
            this.showError('Please enter an email address to preview');
            return;
        }

        document.getElementById('previewEmail').textContent = formData.email;
        
        const previewContent = this.generateEmailContent(formData, 'preview');
        document.getElementById('previewContent').innerHTML = previewContent;
        
        document.getElementById('invitationPreview').style.display = 'block';
    }

    hidePreview() {
        document.getElementById('invitationPreview').style.display = 'none';
    }

    applyTemplate(templateName) {
        const template = this.roleTemplates[templateName];
        if (!template) return;

        // Set role
        document.getElementById('userRole').value = templateName;
        
        // Apply permissions
        this.applyRolePermissions(templateName);
        
        this.closeModal('roleTemplatesModal');
        this.showSuccess(`Applied ${template.name} template`);
    }

    saveDraft() {
        const formData = this.collectFormData();
        const draftData = {
            ...formData,
            savedAt: new Date().toISOString(),
            factoryId: this.currentFactory
        };

        localStorage.setItem('invitationDraft', JSON.stringify(draftData));
        this.showSuccess('Draft saved successfully');
    }

    loadInvitationDraft() {
        const draft = localStorage.getItem('invitationDraft');
        if (draft) {
            try {
                const draftData = JSON.parse(draft);
                if (draftData.factoryId === this.currentFactory) {
                    this.populateForm(draftData);
                    this.invitationDraft = draftData;
                }
            } catch (error) {
                console.error('Error loading draft:', error);
            }
        }
    }

    autoSaveDraft() {
        // Debounce auto-save to avoid too frequent saves
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            this.saveDraft();
        }, 2000);
    }

    populateForm(data) {
        // Populate form fields with draft data
        Object.keys(data).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = data[key];
                } else {
                    element.value = data[key];
                }
            }
        });

        // Apply role permissions if role is set
        if (data.userRole) {
            this.applyRolePermissions(data.userRole);
        }
    }

    resetForm() {
        document.getElementById('invitationForm').reset();
        
        // Clear all permission checkboxes
        const checkboxes = document.querySelectorAll('#invitationForm input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // Clear draft
        localStorage.removeItem('invitationDraft');
        this.invitationDraft = null;
    }

    collectFormData() {
        const permissions = {};
        const permissionCheckboxes = document.querySelectorAll('#invitationForm input[type="checkbox"][id^="perm"]');
        permissionCheckboxes.forEach(checkbox => {
            permissions[checkbox.id] = checkbox.checked;
        });

        return {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            userRole: document.getElementById('userRole').value,
            department: document.getElementById('department').value,
            position: document.getElementById('position').value.trim(),
            permissions: permissions,
            invitationMessage: document.getElementById('invitationMessage').value.trim(),
            expiryDays: document.getElementById('expiryDays').value,
            sendWelcomeEmail: document.getElementById('sendWelcomeEmail').checked,
            requireMFA: document.getElementById('requireMFA').checked
        };
    }

    validateFormData(data) {
        if (!data.firstName) {
            this.showError('First name is required');
            return false;
        }
        if (!data.lastName) {
            this.showError('Last name is required');
            return false;
        }
        if (!data.email) {
            this.showError('Email address is required');
            return false;
        }
        if (!this.isValidEmail(data.email)) {
            this.showError('Please enter a valid email address');
            return false;
        }
        if (!data.userRole) {
            this.showError('Please select a user role');
            return false;
        }
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    calculateExpiryDate(days) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);
        return firebase.firestore.Timestamp.fromDate(expiryDate);
    }

    generateInvitationToken() {
        return 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getRoleDisplayName(role) {
        return this.roleTemplates[role]?.name || role;
    }

    showLoading(message) {
        // Implement loading indicator
        console.log('Loading:', message);
    }

    hideLoading() {
        // Hide loading indicator
        console.log('Loading complete');
    }

    showSuccess(message) {
        // Implement success notification
        alert(message); // Replace with proper notification system
    }

    showError(message) {
        // Implement error notification
        alert('Error: ' + message); // Replace with proper notification system
    }
}

// Global functions for button actions
let userInvitationModal;

function saveDraft() {
    userInvitationModal.saveDraft();
}

function previewInvitation() {
    userInvitationModal.previewInvitation();
}

function hidePreview() {
    userInvitationModal.hidePreview();
}

function applyTemplate(templateName) {
    userInvitationModal.applyTemplate(templateName);
}

function sendBulkInvitations() {
    userInvitationModal.sendBulkInvitations();
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    userInvitationModal = new UserInvitationModal();
    window.userInvitationModal = userInvitationModal;
    userInvitationModal.init();
});
