// Factory Worker Portal System
class FactoryWorkerPortal {
    constructor() {
        this.currentUser = null;
        this.workerData = null;
        this.factoryData = null;
        this.notifications = [];
        this.trainingProgress = [];
        this.recentActivity = [];
        this.currentLanguage = 'en';
        
        this.init();
    }
    
    async init() {
        console.log('🏭 Initializing Factory Worker Portal...');
        
        // Initialize Firebase
        await this.initializeFirebase();
        
        // Check authentication
        await this.checkAuthentication();
        
        // Initialize UI
        this.initializeUI();
        
        // Load worker data
        await this.loadWorkerData();
        
        // Load initial data
        await this.loadInitialData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Factory Worker Portal initialized');
    }
    
    async initializeFirebase() {
        try {
            if (window.Firebase) {
                this.auth = window.Firebase.auth;
                this.db = window.Firebase.db;
                this.doc = window.Firebase.doc;
                this.getDoc = window.Firebase.getDoc;
                this.collection = window.Firebase.collection;
                this.addDoc = window.Firebase.addDoc;
                this.updateDoc = window.Firebase.updateDoc;
                this.query = window.Firebase.query;
                this.where = window.Firebase.where;
                this.orderBy = window.Firebase.orderBy;
                this.onSnapshot = window.Firebase.onSnapshot;
                this.serverTimestamp = window.Firebase.serverTimestamp;
                
                console.log('✓ Firebase initialized successfully');
                return true;
            } else {
                console.log('⚠ Firebase not available, using local mode');
                return false;
            }
        } catch (error) {
            console.error('✗ Error initializing Firebase:', error);
            return false;
        }
    }
    
    async checkAuthentication() {
        return new Promise((resolve) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    try {
                        const userDocRef = this.doc(this.db, 'users', user.uid);
                        const userDoc = await this.getDoc(userDocRef);
                        
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            
                            // Allow workers and factory admins
                            if (userData.role === 'worker' || userData.role === 'factory_admin') {
                                this.currentUser = { ...user, ...userData };
                                resolve();
                            } else {
                                console.log('❌ Access denied - insufficient permissions');
                                window.location.href = '../../login.html';
                            }
                        } else {
                            console.log('❌ User profile not found');
                            window.location.href = '../../login.html';
                        }
                    } catch (error) {
                        console.error('Error checking authentication:', error);
                        window.location.href = '../../login.html';
                    }
                } else {
                    console.log('❌ No authenticated user');
                    window.location.href = '../../login.html';
                }
            });
        });
    }
    
    async loadWorkerData() {
        try {
            if (this.currentUser.role === 'worker') {
                // Load worker-specific data
                const workerDocRef = this.doc(this.db, 'workers', this.currentUser.uid);
                const workerDoc = await this.getDoc(workerDocRef);
                
                if (workerDoc.exists()) {
                    this.workerData = { id: workerDoc.id, ...workerDoc.data() };
                }
            }
            
            // Load factory data
            if (this.currentUser.factoryId) {
                const factoryDocRef = this.doc(this.db, 'factories', this.currentUser.factoryId);
                const factoryDoc = await this.getDoc(factoryDocRef);
                
                if (factoryDoc.exists()) {
                    this.factoryData = { id: factoryDoc.id, ...factoryDoc.data() };
                }
            }
            
            this.updateWorkerHeader();
        } catch (error) {
            console.error('Error loading worker data:', error);
        }
    }
    
    updateWorkerHeader() {
        const workerName = document.getElementById('workerName');
        const factoryName = document.getElementById('factoryName');
        const workerId = document.getElementById('workerId');
        const joinDate = document.getElementById('joinDate');
        const workerAvatar = document.getElementById('workerAvatar');
        
        if (this.currentUser) {
            workerName.textContent = this.currentUser.name || this.currentUser.displayName || 'Worker';
            workerId.textContent = `ID: ${this.currentUser.uid.substring(0, 8)}`;
            
            // Set avatar initials
            const initials = (this.currentUser.name || 'W').split(' ').map(n => n[0]).join('').toUpperCase();
            workerAvatar.innerHTML = `<span>${initials}</span>`;
        }
        
        if (this.factoryData) {
            factoryName.textContent = this.factoryData.name || 'Factory';
        }
        
        if (this.workerData) {
            const joinDateText = this.workerData.joinDate ? 
                new Date(this.workerData.joinDate.toDate()).toLocaleDateString() : 
                'N/A';
            joinDate.textContent = `Joined: ${joinDateText}`;
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadNotifications(),
            this.loadTrainingProgress(),
            this.loadRecentActivity(),
            this.loadStatistics()
        ]);
    }
    
    async loadNotifications() {
        try {
            const notificationsRef = this.collection(this.db, 'notifications');
            const q = this.query(
                notificationsRef,
                this.where('recipientId', '==', this.currentUser.uid),
                this.where('read', '==', false),
                this.orderBy('createdAt', 'desc'),
                this.limit(5)
            );
            
            const snapshot = await this.getDocs(q);
            this.notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.updateNotificationsDisplay();
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }
    
    async loadTrainingProgress() {
        try {
            const trainingRef = this.collection(this.db, 'worker_training');
            const q = this.query(
                trainingRef,
                this.where('workerId', '==', this.currentUser.uid),
                this.orderBy('dueDate', 'asc')
            );
            
            const snapshot = await this.getDocs(q);
            this.trainingProgress = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.updateTrainingDisplay();
        } catch (error) {
            console.error('Error loading training progress:', error);
        }
    }
    
    async loadRecentActivity() {
        try {
            const activityRef = this.collection(this.db, 'worker_activity');
            const q = this.query(
                activityRef,
                this.where('workerId', '==', this.currentUser.uid),
                this.orderBy('timestamp', 'desc'),
                this.limit(10)
            );
            
            const snapshot = await this.getDocs(q);
            this.recentActivity = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.updateActivityDisplay();
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }
    
    async loadStatistics() {
        try {
            // Load training completed count
            const trainingRef = this.collection(this.db, 'worker_training');
            const trainingQuery = this.query(
                trainingRef,
                this.where('workerId', '==', this.currentUser.uid),
                this.where('status', '==', 'completed')
            );
            const trainingSnapshot = await this.getDocs(trainingQuery);
            const trainingCompleted = trainingSnapshot.size;
            
            // Load cases submitted count
            const casesRef = this.collection(this.db, 'grievances');
            const casesQuery = this.query(
                casesRef,
                this.where('workerId', '==', this.currentUser.uid)
            );
            const casesSnapshot = await this.getDocs(casesQuery);
            const casesSubmitted = casesSnapshot.size;
            
            // Load pending actions count
            const pendingQuery = this.query(
                trainingRef,
                this.where('workerId', '==', this.currentUser.uid),
                this.where('status', 'in', ['pending', 'overdue'])
            );
            const pendingSnapshot = await this.getDocs(pendingQuery);
            const pendingActions = pendingSnapshot.size;
            
            // Calculate work days (simplified)
            const workDays = this.workerData ? 
                Math.floor((Date.now() - this.workerData.joinDate.toDate()) / (1000 * 60 * 60 * 24)) : 0;
            
            // Update statistics display
            document.getElementById('trainingCompleted').textContent = trainingCompleted;
            document.getElementById('casesSubmitted').textContent = casesSubmitted;
            document.getElementById('pendingActions').textContent = pendingActions;
            document.getElementById('workDays').textContent = Math.max(0, workDays);
            
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }
    
    updateNotificationsDisplay() {
        const notificationsList = document.getElementById('notificationsList');
        
        if (this.notifications.length === 0) {
            notificationsList.innerHTML = `
                <div style="text-align: center; padding: var(--space-4); color: var(--neutral-500);">
                    <i data-lucide="bell-off" style="width: 24px; height: 24px; margin-bottom: var(--space-2);"></i>
                    <p data-en="No new notifications" data-km="គ្មានការជូនដំណឹងថ្មី">No new notifications</p>
                </div>
            `;
        } else {
            notificationsList.innerHTML = this.notifications.map(notification => `
                <div class="notification-item">
                    <div class="notification-icon">
                        <i data-lucide="${this.getNotificationIcon(notification.type)}"></i>
                    </div>
                    <div class="notification-content">
                        <h4>${notification.title}</h4>
                        <p>${notification.message}</p>
                        <div class="notification-time">${this.formatTime(notification.createdAt)}</div>
                    </div>
                </div>
            `).join('');
        }
        
        // Reinitialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    updateTrainingDisplay() {
        const trainingProgress = document.getElementById('trainingProgress');
        
        if (this.trainingProgress.length === 0) {
            trainingProgress.innerHTML = `
                <div style="text-align: center; padding: var(--space-4); color: var(--neutral-500);">
                    <i data-lucide="book-open" style="width: 24px; height: 24px; margin-bottom: var(--space-2);"></i>
                    <p data-en="No training assigned" data-km="គ្មានការបណ្តុះបណ្តាលត្រូវដាក់">No training assigned</p>
                </div>
            `;
        } else {
            trainingProgress.innerHTML = this.trainingProgress.map(training => `
                <div class="training-item" onclick="openTraining('${training.id}')">
                    <div class="training-status status-${training.status}"></div>
                    <div class="training-info">
                        <h4>${training.title}</h4>
                        <p data-en="Due: ${this.formatDate(training.dueDate)}" data-km="ថ្ងៃផុតកំណត់: ${this.formatDate(training.dueDate)}">Due: ${this.formatDate(training.dueDate)}</p>
                    </div>
                </div>
            `).join('');
        }
    }
    
    updateActivityDisplay() {
        const recentActivity = document.getElementById('recentActivity');
        
        if (this.recentActivity.length === 0) {
            recentActivity.innerHTML = `
                <div style="text-align: center; padding: var(--space-4); color: var(--neutral-500);">
                    <i data-lucide="activity" style="width: 24px; height: 24px; margin-bottom: var(--space-2);"></i>
                    <p data-en="No recent activity" data-km="គ្មានសកម្មភាពថ្មីៗ">No recent activity</p>
                </div>
            `;
        } else {
            recentActivity.innerHTML = this.recentActivity.map(activity => `
                <div style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3); border-bottom: 1px solid var(--neutral-200);">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary-100); display: flex; align-items: center; justify-content: center; color: var(--primary-600);">
                        <i data-lucide="${this.getActivityIcon(activity.type)}" style="width: 16px; height: 16px;"></i>
                    </div>
                    <div style="flex: 1;">
                        <h4 style="font-size: var(--text-sm); font-weight: 600; color: var(--neutral-900); margin-bottom: var(--space-1);">${activity.title}</h4>
                        <p style="font-size: var(--text-xs); color: var(--neutral-600);">${activity.description}</p>
                        <div style="font-size: var(--text-xs); color: var(--neutral-500); margin-top: var(--space-1);">${this.formatTime(activity.timestamp)}</div>
                    </div>
                </div>
            `).join('');
        }
        
        // Reinitialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    initializeUI() {
        // Initialize language toggle
        this.setupLanguageToggle();
        
        // Initialize form placeholders
        this.updateFormPlaceholders();
    }
    
    setupLanguageToggle() {
        const languageButtons = document.querySelectorAll('.language-btn');
        
        languageButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                this.switchLanguage(lang);
                
                // Update active button
                languageButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
    
    switchLanguage(lang) {
        this.currentLanguage = lang;
        
        // Update all translatable elements
        const translatableElements = document.querySelectorAll('[data-en]');
        translatableElements.forEach(element => {
            const text = element.getAttribute(`data-${lang}`);
            if (text) {
                element.textContent = text;
            }
        });
        
        // Update placeholders
        this.updateFormPlaceholders();
    }
    
    updateFormPlaceholders() {
        const placeholders = document.querySelectorAll('[data-en-placeholder]');
        placeholders.forEach(element => {
            const placeholder = element.getAttribute(`data-${this.currentLanguage}-placeholder`);
            if (placeholder) {
                element.placeholder = placeholder;
            }
        });
    }
    
    setupEventListeners() {
        // Grievance form submission
        const grievanceForm = document.getElementById('grievanceSubmissionForm');
        if (grievanceForm) {
            grievanceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitGrievance();
            });
        }
        
        // Quick action buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.action-card')) {
                const action = e.target.closest('.action-card').getAttribute('onclick');
                if (action) {
                    eval(action);
                }
            }
        });
    }
    
    async submitGrievance() {
        try {
            const formData = new FormData(document.getElementById('grievanceSubmissionForm'));
            const grievanceData = {
                type: formData.get('grievanceType'),
                priority: formData.get('priority'),
                title: formData.get('grievanceTitle'),
                description: formData.get('grievanceDescription'),
                anonymous: formData.get('anonymous') === 'true',
                contactPreference: formData.get('contactPreference'),
                workerId: this.currentUser.uid,
                factoryId: this.currentUser.factoryId,
                status: 'pending',
                createdAt: this.serverTimestamp(),
                updatedAt: this.serverTimestamp()
            };
            
            // Add to Firestore
            const grievanceRef = this.collection(this.db, 'grievances');
            await this.addDoc(grievanceRef, grievanceData);
            
            // Show success message
            this.showNotification('success', 'Grievance submitted successfully', 'បញ្ហាបានដាក់ស្នើដោយជោគជ័យ');
            
            // Close form
            this.closeGrievanceForm();
            
            // Reset form
            document.getElementById('grievanceSubmissionForm').reset();
            
            // Reload statistics
            await this.loadStatistics();
            
        } catch (error) {
            console.error('Error submitting grievance:', error);
            this.showNotification('error', 'Error submitting grievance', 'កំហុសក្នុងការដាក់ស្នើបញ្ហា');
        }
    }
    
    showNotification(type, messageEn, messageKm) {
        const message = this.currentLanguage === 'en' ? messageEn : messageKm;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-500)' : 'var(--error-500)'};
            color: white;
            padding: var(--space-4);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    // Utility functions
    getNotificationIcon(type) {
        const icons = {
            'training': 'book-open',
            'grievance': 'alert-triangle',
            'safety': 'shield',
            'general': 'bell',
            'default': 'info'
        };
        return icons[type] || icons.default;
    }
    
    getActivityIcon(type) {
        const icons = {
            'training_completed': 'check-circle',
            'grievance_submitted': 'alert-triangle',
            'login': 'log-in',
            'logout': 'log-out',
            'default': 'activity'
        };
        return icons[type] || icons.default;
    }
    
    formatTime(timestamp) {
        if (!timestamp) return 'N/A';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }
    
    formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
    }
}

// Global functions for HTML onclick handlers
function openGrievanceForm() {
    document.getElementById('grievanceForm').style.display = 'block';
    document.getElementById('grievanceForm').scrollIntoView({ behavior: 'smooth' });
}

function closeGrievanceForm() {
    document.getElementById('grievanceForm').style.display = 'none';
}

function openTrainingPortal() {
    // Navigate to training portal
    window.location.href = '../worker-portal/training-materials.html';
}

function openCaseTracking() {
    // Navigate to case tracking
    window.location.href = '../worker-portal/case-tracking.html';
}

function openComplianceInfo() {
    // Navigate to compliance information
    window.location.href = '../worker-portal/compliance-info.html';
}

function openTraining(trainingId) {
    // Navigate to specific training
    window.location.href = `../worker-portal/training-materials.html?id=${trainingId}`;
}

function openSafetyGuidelines() {
    // Navigate to safety guidelines
    window.location.href = '../worker-portal/safety-guidelines.html';
}

function openWorkerRights() {
    // Navigate to worker rights
    window.location.href = '../worker-portal/worker-rights.html';
}

function openEmergencyContacts() {
    // Navigate to emergency contacts
    window.location.href = '../worker-portal/emergency-contacts.html';
}

// Initialize the portal when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize the worker portal
    window.workerPortal = new FactoryWorkerPortal();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FactoryWorkerPortal;
}
