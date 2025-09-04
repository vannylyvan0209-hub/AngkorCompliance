// Anonymous Grievance Form System
// Provides safe, anonymous grievance submission with multi-step workflow
// Supports file uploads, evidence collection, and retaliation protection

class AnonymousGrievanceForm {
    constructor() {
        this.currentLanguage = 'en';
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {
            category: '',
            severity: '',
            incidentDate: '',
            incidentTime: '',
            location: '',
            description: '',
            witnesses: '',
            impact: '',
            previousReports: '',
            evidence: [],
            anonymousId: ''
        };
        this.initializeForm();
    }

    initializeForm() {
        this.setupEventListeners();
        this.generateAnonymousId();
        this.updateLanguage();
        this.showStep(1);
    }

    setupEventListeners() {
        // Language toggle
        const languageToggle = document.getElementById('language-toggle');
        if (languageToggle) {
            languageToggle.addEventListener('click', () => this.toggleLanguage());
        }

        // Navigation buttons
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const submitBtn = document.getElementById('submit-btn');

        if (nextBtn) nextBtn.addEventListener('click', () => this.nextStep());
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevStep());
        if (submitBtn) submitBtn.addEventListener('click', () => this.submitForm());

        // Form inputs
        this.setupFormInputs();
        this.setupFileUpload();
    }

    setupFormInputs() {
        // Category selection
        const categoryInputs = document.querySelectorAll('input[name="category"]');
        categoryInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.formData.category = e.target.value;
                this.validateStep(1);
            });
        });

        // Severity selection
        const severityInputs = document.querySelectorAll('input[name="severity"]');
        severityInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.formData.severity = e.target.value;
                this.validateStep(1);
            });
        });

        // Text inputs
        const textInputs = ['incidentDate', 'incidentTime', 'location', 'description', 'witnesses', 'impact', 'previousReports'];
        textInputs.forEach(field => {
            const input = document.getElementById(field);
            if (input) {
                input.addEventListener('input', (e) => {
                    this.formData[field] = e.target.value;
                    this.validateStep(this.getStepForField(field));
                });
            }
        });
    }

    setupFileUpload() {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const fileList = document.getElementById('file-list');

        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('drag-over');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                const files = Array.from(e.dataTransfer.files);
                this.handleFiles(files);
            });

            dropZone.addEventListener('click', () => {
                fileInput.click();
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                this.handleFiles(files);
            });
        }
    }

    handleFiles(files) {
        files.forEach(file => {
            if (this.validateFile(file)) {
                this.addFileToList(file);
                this.formData.evidence.push({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    file: file
                });
            }
        });
        this.validateStep(3);
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];

        if (file.size > maxSize) {
            this.showNotification('File too large. Maximum size is 10MB.', 'error');
            return false;
        }

        if (!allowedTypes.includes(file.type)) {
            this.showNotification('File type not supported. Please use images, PDFs, or text files.', 'error');
            return false;
        }

        return true;
    }

    addFileToList(file) {
        const fileList = document.getElementById('file-list');
        if (!fileList) return;

        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">${this.formatFileSize(file.size)}</span>
            </div>
            <button type="button" class="remove-file" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        fileList.appendChild(fileItem);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getStepForField(field) {
        const stepMap = {
            'incidentDate': 2,
            'incidentTime': 2,
            'location': 2,
            'description': 2,
            'witnesses': 2,
            'impact': 2,
            'previousReports': 2
        };
        return stepMap[field] || 1;
    }

    validateStep(step) {
        let isValid = true;
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');

        switch (step) {
            case 1:
                isValid = this.formData.category && this.formData.severity;
                break;
            case 2:
                isValid = this.formData.incidentDate && this.formData.description;
                break;
            case 3:
                // Evidence is optional
                isValid = true;
                break;
            case 4:
                // Review step - always valid
                isValid = true;
                break;
        }

        if (nextBtn) nextBtn.disabled = !isValid;
        if (submitBtn) submitBtn.disabled = !this.isFormComplete();

        return isValid;
    }

    isFormComplete() {
        return this.formData.category && 
               this.formData.severity && 
               this.formData.incidentDate && 
               this.formData.description;
    }

    nextStep() {
        if (this.currentStep < this.totalSteps && this.validateStep(this.currentStep)) {
            this.currentStep++;
            this.showStep(this.currentStep);
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }

    showStep(step) {
        // Hide all steps
        for (let i = 1; i <= this.totalSteps; i++) {
            const stepElement = document.getElementById(`step-${i}`);
            if (stepElement) {
                stepElement.style.display = 'none';
            }
        }

        // Show current step
        const currentStepElement = document.getElementById(`step-${step}`);
        if (currentStepElement) {
            currentStepElement.style.display = 'block';
        }

        // Update progress bar
        this.updateProgressBar(step);

        // Update navigation buttons
        this.updateNavigationButtons(step);

        // Update step indicators
        this.updateStepIndicators(step);
    }

    updateProgressBar(step) {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            const progress = (step / this.totalSteps) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    updateNavigationButtons(step) {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');

        if (prevBtn) prevBtn.style.display = step === 1 ? 'none' : 'inline-block';
        if (nextBtn) nextBtn.style.display = step === this.totalSteps ? 'none' : 'inline-block';
        if (submitBtn) submitBtn.style.display = step === this.totalSteps ? 'inline-block' : 'none';
    }

    updateStepIndicators(step) {
        for (let i = 1; i <= this.totalSteps; i++) {
            const indicator = document.querySelector(`.step-indicator[data-step="${i}"]`);
            if (indicator) {
                if (i < step) {
                    indicator.classList.add('completed');
                    indicator.classList.remove('active');
                } else if (i === step) {
                    indicator.classList.add('active');
                    indicator.classList.remove('completed');
                } else {
                    indicator.classList.remove('active', 'completed');
                }
            }
        }
    }

    generateAnonymousId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        this.formData.anonymousId = `GRIEVANCE-${timestamp}-${random}`.toUpperCase();
    }

    async submitForm() {
        if (!this.isFormComplete()) {
            this.showNotification('Please complete all required fields.', 'error');
            return;
        }

        try {
            // Show loading state
            const submitBtn = document.getElementById('submit-btn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            }

            // Prepare submission data
            const submissionData = {
                ...this.formData,
                submittedAt: new Date().toISOString(),
                status: 'submitted'
            };

            // In a real implementation, this would be sent to the server
            // For now, we'll simulate the submission
            await this.simulateSubmission(submissionData);

            // Show success message
            this.showSuccessMessage();

        } catch (error) {
            console.error('Submission error:', error);
            this.showNotification('An error occurred while submitting. Please try again.', 'error');
            
            // Reset submit button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Submit Grievance';
            }
        }
    }

    async simulateSubmission(data) {
        // Simulate API call delay
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Grievance submitted:', data);
                resolve({ success: true, id: this.formData.anonymousId });
            }, 2000);
        });
    }

    showSuccessMessage() {
        const formContainer = document.querySelector('.grievance-form-container');
        if (formContainer) {
            formContainer.innerHTML = `
                <div class="success-message">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2>${this.currentLanguage === 'en' ? 'Grievance Submitted Successfully!' : 'បានដាក់ស្នើអំណឹតអំណាងដោយជោគជ័យ!'}</h2>
                    <p class="anonymous-id">${this.currentLanguage === 'en' ? 'Anonymous ID:' : 'លេខសម្គាល់អនាមិក:'} <strong>${this.formData.anonymousId}</strong></p>
                    <p>${this.currentLanguage === 'en' ? 'Your grievance has been submitted anonymously. Please save this ID to track your case status.' : 'អំណឹតអំណាងរបស់អ្នកត្រូវបានដាក់ស្នើជាអនាមិក។ សូមរក្សាលេខសម្គាល់នេះដើម្បីតាមដានស្ថានភាពករណីរបស់អ្នក។'}</p>
                    <div class="next-steps">
                        <h3>${this.currentLanguage === 'en' ? 'Next Steps:' : 'ជំហានបន្ទាប់:'}</h3>
                        <ul>
                            <li>${this.currentLanguage === 'en' ? 'Your case will be reviewed within 24 hours' : 'ករណីរបស់អ្នកនឹងត្រូវបានពិនិត្យក្នុងរយៈពេល ២៤ ម៉ោង'}</li>
                            <li>${this.currentLanguage === 'en' ? 'You can track progress using your Anonymous ID' : 'អ្នកអាចតាមដានការវិវត្តដោយប្រើលេខសម្គាល់អនាមិករបស់អ្នក'}</li>
                            <li>${this.currentLanguage === 'en' ? 'All communications will be anonymous' : 'ការទំនាក់ទំនងទាំងអស់នឹងជាអនាមិក'}</li>
                        </ul>
                    </div>
                    <button type="button" class="btn btn-primary" onclick="window.location.href='worker-app.html'">
                        ${this.currentLanguage === 'en' ? 'Return to Worker App' : 'ត្រឡប់ទៅកាន់កម្មវិធីកម្មករ'}
                    </button>
                </div>
            `;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button type="button" class="close-notification">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Close button functionality
        const closeBtn = notification.querySelector('.close-notification');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => notification.remove());
        }
    }

    updateLanguage() {
        const elements = document.querySelectorAll('[data-en], [data-kh]');
        elements.forEach(element => {
            if (this.currentLanguage === 'en' && element.dataset.en) {
                element.textContent = element.dataset.en;
            } else if (this.currentLanguage === 'kh' && element.dataset.kh) {
                element.textContent = element.dataset.kh;
            }
        });
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'kh' : 'en';
        this.updateLanguage();
        
        // Update language toggle button
        const languageToggle = document.getElementById('language-toggle');
        if (languageToggle) {
            languageToggle.textContent = this.currentLanguage === 'en' ? 'ខ្មែរ' : 'English';
        }
    }
}

// Initialize the form when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AnonymousGrievanceForm();
});
