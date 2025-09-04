// Case Intake Screen
// Grievance Committee - Case Submission and Processing

class CaseIntake {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.formData = {
            isAnonymous: false,
            workerId: '',
            workerName: '',
            department: '',
            contactNumber: '',
            caseTitle: '',
            description: '',
            incidentDate: '',
            location: '',
            category: '',
            severity: '',
            additionalInfo: ''
        };
        this.selectedCategory = '';
        this.selectedSeverity = '';
        this.init();
    }

    async init() {
        try {
            console.log('🔧 Initializing Case Intake Screen...');
            
            // Wait for Firebase to be available
            if (!window.Firebase) {
                console.log('⏳ Waiting for Firebase to initialize...');
                setTimeout(() => this.init(), 100);
                return;
            }

            await this.checkAuthentication();
            this.setupEventListeners();
            this.updatePreview();
            this.isInitialized = true;
            
            console.log('✅ Case Intake Screen initialized');
        } catch (error) {
            console.error('❌ Error initializing Case Intake:', error);
        }
    }

    async checkAuthentication() {
        try {
            const { auth, db } = window.Firebase;
            const { doc, getDoc } = window.Firebase;
            
            return new Promise((resolve, reject) => {
                auth.onAuthStateChanged(async (user) => {
                    if (!user) {
                        window.location.href = '../../login.html';
                        reject(new Error('User not authenticated'));
                        return;
                    }

                    try {
                        const userDocRef = doc(db, 'users', user.uid);
                        const userDoc = await getDoc(userDocRef);
                        
                        if (!userDoc.exists()) {
                            window.location.href = '../../login.html';
                            reject(new Error('User document not found'));
                            return;
                        }

                        const userData = userDoc.data();
                        this.currentUser = { id: user.uid, ...userData };
                        
                        // Check if user has grievance committee access
                        if (!['grievance_committee', 'super_admin'].includes(userData.role)) {
                            window.location.href = '../../dashboard.html';
                            reject(new Error('Insufficient permissions'));
                            return;
                        }

                        console.log('✅ Authentication verified for:', userData.name || userData.email);
                        resolve();
                    } catch (error) {
                        console.error('❌ Error checking authentication:', error);
                        reject(error);
                    }
                });
            });
        } catch (error) {
            console.error('❌ Error in authentication check:', error);
            throw error;
        }
    }

    setupEventListeners() {
        try {
            // Set up form input listeners
            const formInputs = [
                'workerId', 'workerName', 'department', 'contactNumber',
                'caseTitle', 'description', 'incidentDate', 'location', 'additionalInfo'
            ];

            formInputs.forEach(inputId => {
                const element = document.getElementById(inputId);
                if (element) {
                    element.addEventListener('input', () => {
                        this.formData[inputId] = element.value;
                        this.updatePreview();
                    });
                }
            });

            console.log('🎧 Event listeners set up');
        } catch (error) {
            console.error('❌ Error setting up event listeners:', error);
        }
    }

    // Form Actions
    toggleAnonymous() {
        try {
            const toggle = document.getElementById('anonymousToggle');
            const workerInfo = document.getElementById('workerInfo');
            
            this.formData.isAnonymous = !this.formData.isAnonymous;
            
            if (this.formData.isAnonymous) {
                toggle.classList.add('active');
                workerInfo.style.display = 'none';
                // Clear worker information
                this.formData.workerId = '';
                this.formData.workerName = '';
                this.formData.department = '';
                this.formData.contactNumber = '';
                
                // Clear form fields
                document.getElementById('workerId').value = '';
                document.getElementById('workerName').value = '';
                document.getElementById('department').value = '';
                document.getElementById('contactNumber').value = '';
            } else {
                toggle.classList.remove('active');
                workerInfo.style.display = 'block';
            }
            
            this.updatePreview();
            console.log('🔄 Anonymous mode toggled:', this.formData.isAnonymous);
        } catch (error) {
            console.error('❌ Error toggling anonymous mode:', error);
        }
    }

    selectCategory(category) {
        try {
            // Remove previous selection
            document.querySelectorAll('.category-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Add selection to clicked option
            const selectedOption = document.querySelector(`[data-category="${category}"]`);
            if (selectedOption) {
                selectedOption.classList.add('selected');
            }
            
            this.selectedCategory = category;
            this.formData.category = category;
            this.updatePreview();
            
            console.log('📋 Category selected:', category);
        } catch (error) {
            console.error('❌ Error selecting category:', error);
        }
    }

    selectSeverity(severity) {
        try {
            // Remove previous selection
            document.querySelectorAll('.severity-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Add selection to clicked option
            const selectedOption = document.querySelector(`[data-severity="${severity}"]`);
            if (selectedOption) {
                selectedOption.classList.add('selected');
            }
            
            this.selectedSeverity = severity;
            this.formData.severity = severity;
            this.updatePreview();
            
            console.log('⚠️ Severity selected:', severity);
        } catch (error) {
            console.error('❌ Error selecting severity:', error);
        }
    }

    updatePreview() {
        try {
            // Update preview values
            document.getElementById('previewTitle').textContent = this.formData.caseTitle || 'Not provided';
            document.getElementById('previewCategory').textContent = this.formatCategory(this.selectedCategory) || 'Not selected';
            document.getElementById('previewSeverity').textContent = this.formatSeverity(this.selectedSeverity) || 'Not assessed';
            document.getElementById('previewDate').textContent = this.formData.incidentDate || 'Not specified';
            document.getElementById('previewLocation').textContent = this.formData.location || 'Not specified';
            document.getElementById('previewDescription').textContent = this.formData.description || 'No description provided';
            
            // Update worker information
            if (this.formData.isAnonymous) {
                document.getElementById('previewWorker').textContent = 'Anonymous submission';
            } else {
                const workerName = this.formData.workerName || 'Not provided';
                const workerId = this.formData.workerId || 'Not provided';
                document.getElementById('previewWorker').textContent = `${workerName} (ID: ${workerId})`;
            }
            
            // Calculate and update completion percentage
            const completion = this.calculateCompletion();
            document.getElementById('previewCompletion').textContent = `${completion}%`;
            
            // Update progress bar
            document.getElementById('progressFill').style.width = `${completion}%`;
            
            console.log('👁️ Preview updated');
        } catch (error) {
            console.error('❌ Error updating preview:', error);
        }
    }

    calculateCompletion() {
        try {
            let completedFields = 0;
            const totalFields = 8; // Total number of required fields
            
            // Check required fields
            if (this.formData.caseTitle) completedFields++;
            if (this.formData.description) completedFields++;
            if (this.formData.incidentDate) completedFields++;
            if (this.formData.location) completedFields++;
            if (this.selectedCategory) completedFields++;
            if (this.selectedSeverity) completedFields++;
            
            // Check worker information (only if not anonymous)
            if (this.formData.isAnonymous) {
                completedFields += 2; // Skip worker info for anonymous submissions
            } else {
                if (this.formData.workerName) completedFields++;
                if (this.formData.workerId) completedFields++;
            }
            
            return Math.round((completedFields / totalFields) * 100);
        } catch (error) {
            console.error('❌ Error calculating completion:', error);
            return 0;
        }
    }

    formatCategory(category) {
        const categoryMap = {
            'harassment': 'Harassment',
            'wage': 'Wage Issues',
            'safety': 'Safety Concerns',
            'discrimination': 'Discrimination',
            'working_conditions': 'Working Conditions',
            'other': 'Other'
        };
        return categoryMap[category] || category;
    }

    formatSeverity(severity) {
        const severityMap = {
            'low': 'Low',
            'medium': 'Medium',
            'high': 'High',
            'critical': 'Critical'
        };
        return severityMap[severity] || severity;
    }

    validateForm() {
        try {
            const errors = [];
            
            // Required field validation
            if (!this.formData.caseTitle.trim()) {
                errors.push('Case title is required');
            }
            
            if (!this.formData.description.trim()) {
                errors.push('Detailed description is required');
            }
            
            if (!this.formData.incidentDate) {
                errors.push('Incident date is required');
            }
            
            if (!this.formData.location.trim()) {
                errors.push('Location is required');
            }
            
            if (!this.selectedCategory) {
                errors.push('Grievance category is required');
            }
            
            if (!this.selectedSeverity) {
                errors.push('Severity assessment is required');
            }
            
            // Worker information validation (only if not anonymous)
            if (!this.formData.isAnonymous) {
                if (!this.formData.workerName.trim()) {
                    errors.push('Worker name is required');
                }
                
                if (!this.formData.workerId.trim()) {
                    errors.push('Worker ID is required');
                }
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors
            };
        } catch (error) {
            console.error('❌ Error validating form:', error);
            return {
                isValid: false,
                errors: ['Validation error occurred']
            };
        }
    }

    async submitCase() {
        try {
            console.log('📤 Submitting case...');
            
            // Validate form
            const validation = this.validateForm();
            if (!validation.isValid) {
                alert('Please fix the following errors:\n\n' + validation.errors.join('\n'));
                return;
            }
            
            // Show loading state
            const submitBtn = document.getElementById('submitBtn');
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<div class="loading-spinner"></div> Submitting...';
            submitBtn.disabled = true;
            
            // Generate tracking number
            const trackingNumber = this.generateTrackingNumber();
            
            // Prepare case data
            const caseData = {
                trackingNumber: trackingNumber,
                category: this.selectedCategory,
                severity: this.selectedSeverity,
                status: 'new',
                description: this.formData.description,
                caseTitle: this.formData.caseTitle,
                incidentDate: this.formData.incidentDate,
                location: this.formData.location,
                additionalInfo: this.formData.additionalInfo,
                isAnonymous: this.formData.isAnonymous,
                workerId: this.formData.isAnonymous ? null : this.formData.workerId,
                workerName: this.formData.isAnonymous ? null : this.formData.workerName,
                department: this.formData.isAnonymous ? null : this.formData.department,
                contactNumber: this.formData.isAnonymous ? null : this.formData.contactNumber,
                assignedTo: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: this.currentUser.id,
                factoryId: 'factory_001' // Default factory ID
            };
            
            // Submit to Firebase
            const { db } = window.Firebase;
            const { collection, addDoc, serverTimestamp } = window.Firebase;
            
            const casesRef = collection(db, 'grievance_cases');
            const docRef = await addDoc(casesRef, {
                ...caseData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            
            // Reset form
            this.clearForm();
            
            // Show success message
            alert(`Case submitted successfully!\n\nTracking Number: ${trackingNumber}\n\nYou will be notified of any updates.`);
            
            // Reset button
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
            
            console.log('✅ Case submitted successfully:', docRef.id);
        } catch (error) {
            console.error('❌ Error submitting case:', error);
            alert('Error submitting case. Please try again.');
            
            // Reset button
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }
    }

    generateTrackingNumber() {
        try {
            const year = new Date().getFullYear();
            const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            return `GC-${year}-${randomNum}`;
        } catch (error) {
            console.error('❌ Error generating tracking number:', error);
            return `GC-${new Date().getFullYear()}-${Date.now()}`;
        }
    }

    async saveDraft() {
        try {
            console.log('💾 Saving draft...');
            
            const draftData = {
                ...this.formData,
                selectedCategory: this.selectedCategory,
                selectedSeverity: this.selectedSeverity,
                savedAt: new Date(),
                savedBy: this.currentUser.id
            };
            
            // Save to localStorage for now (in production, this would go to Firebase)
            localStorage.setItem('grievance_case_draft', JSON.stringify(draftData));
            
            alert('Draft saved successfully!');
            console.log('✅ Draft saved');
        } catch (error) {
            console.error('❌ Error saving draft:', error);
            alert('Error saving draft. Please try again.');
        }
    }

    async loadDraft() {
        try {
            console.log('📂 Loading draft...');
            
            const draftData = localStorage.getItem('grievance_case_draft');
            if (!draftData) {
                alert('No draft found to load.');
                return;
            }
            
            const draft = JSON.parse(draftData);
            
            // Load form data
            this.formData = { ...draft };
            this.selectedCategory = draft.selectedCategory || '';
            this.selectedSeverity = draft.selectedSeverity || '';
            
            // Update form fields
            Object.keys(this.formData).forEach(key => {
                const element = document.getElementById(key);
                if (element && this.formData[key]) {
                    element.value = this.formData[key];
                }
            });
            
            // Update anonymous toggle
            if (this.formData.isAnonymous) {
                document.getElementById('anonymousToggle').classList.add('active');
                document.getElementById('workerInfo').style.display = 'none';
            }
            
            // Update category selection
            if (this.selectedCategory) {
                this.selectCategory(this.selectedCategory);
            }
            
            // Update severity selection
            if (this.selectedSeverity) {
                this.selectSeverity(this.selectedSeverity);
            }
            
            // Update preview
            this.updatePreview();
            
            alert('Draft loaded successfully!');
            console.log('✅ Draft loaded');
        } catch (error) {
            console.error('❌ Error loading draft:', error);
            alert('Error loading draft. Please try again.');
        }
    }

    clearForm() {
        try {
            console.log('🧹 Clearing form...');
            
            // Reset form data
            this.formData = {
                isAnonymous: false,
                workerId: '',
                workerName: '',
                department: '',
                contactNumber: '',
                caseTitle: '',
                description: '',
                incidentDate: '',
                location: '',
                category: '',
                severity: '',
                additionalInfo: ''
            };
            
            this.selectedCategory = '';
            this.selectedSeverity = '';
            
            // Clear form fields
            const formInputs = [
                'workerId', 'workerName', 'department', 'contactNumber',
                'caseTitle', 'description', 'incidentDate', 'location', 'additionalInfo'
            ];
            
            formInputs.forEach(inputId => {
                const element = document.getElementById(inputId);
                if (element) {
                    element.value = '';
                }
            });
            
            // Reset anonymous toggle
            document.getElementById('anonymousToggle').classList.remove('active');
            document.getElementById('workerInfo').style.display = 'block';
            
            // Clear selections
            document.querySelectorAll('.category-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            document.querySelectorAll('.severity-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Update preview
            this.updatePreview();
            
            console.log('✅ Form cleared');
        } catch (error) {
            console.error('❌ Error clearing form:', error);
        }
    }

    // Cleanup
    destroy() {
        console.log('🧹 Case Intake Screen destroyed');
    }
}

// Global functions for HTML onclick handlers
window.toggleAnonymous = () => window.caseIntake?.toggleAnonymous();
window.selectCategory = (category) => window.caseIntake?.selectCategory(category);
window.selectSeverity = (severity) => window.caseIntake?.selectSeverity(severity);
window.updatePreview = () => window.caseIntake?.updatePreview();
window.submitCase = () => window.caseIntake?.submitCase();
window.saveDraft = () => window.caseIntake?.saveDraft();
window.loadDraft = () => window.caseIntake?.loadDraft();
window.clearForm = () => window.caseIntake?.clearForm();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.caseIntake = new CaseIntake();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.caseIntake) {
        window.caseIntake.destroy();
    }
});
