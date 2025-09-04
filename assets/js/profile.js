// Profile Management
import { 
    auth, 
    db, 
    doc, 
    getDoc, 
    updateDoc, 
    serverTimestamp,
    EmailAuthProvider 
} from '../firebase-config.js';

// Profile Page JavaScript
// Wait for Firebase to be available before initializing
function initializeProfile() {
    // Check if Firebase is available
    if (!window.Firebase) {
        console.log('⏳ Waiting for Firebase to initialize...');
        setTimeout(initializeProfile, 100);
        return;
    }

    // Get Firebase instances and functions from the global Firebase object
    const { auth, db } = window.Firebase;
    const {
        doc,
        getDoc,
        setDoc,
        updateDoc,
        deleteDoc,
        collection,
        query,
        where,
        orderBy,
        limit,
        onSnapshot,
        getDocs,
        addDoc,
        serverTimestamp,
        writeBatch
    } = window.Firebase;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    requireAuth();
    
    // Initialize profile page
    initializeProfile();
    
    // Set up tab navigation
    setupTabs();
    
    // Set up form handlers
    setupFormHandlers();
    
    // Set up password strength checker
    setupPasswordStrength();
});

// Initialize profile page
function initializeProfile() {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Load user profile data
    loadUserProfile();
    
    // Update page language
    updatePageLanguage();
}

// Set up tab navigation
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

// Load user profile data
async function loadUserProfile() {
    try {
        const user = auth.currentUser;
        if (!user) return;

        // Get user profile from Firestore
        const userDoc = await collection(db, 'users', user.uid);
        
        if (userDoc.exists()()) {
            const userData = userDoc.data();
            
            // Populate personal information
            document.getElementById('displayName').value = userData.displayName || user.displayName || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('phone').value = userData.phone || '';
            document.getElementById('role').value = userData.role || 'User';
            document.getElementById('factory').value = userData.factory || 'Not Assigned';
            
            // Populate preferences
            document.getElementById('language').value = userData.language || 'en';
            document.getElementById('theme').value = userData.theme || 'light';
            document.getElementById('notifications').checked = userData.notifications !== false;
            
        } else {
            // Create user profile if it doesn't exist
            await createUserProfile(user);
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        showMessage('Error loading profile data', 'error');
    }
}

// Create user profile in Firestore
async function createUserProfile(user) {
    try {
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            role: 'User',
            factory: 'Not Assigned',
            language: 'en',
            theme: 'light',
            notifications: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await collection(db, 'users', user.uid, userData);
        
        // Reload profile data
        loadUserProfile();
    } catch (error) {
        console.error('Error creating user profile:', error);
        showMessage('Error creating profile', 'error');
    }
}

// Set up form handlers
function setupFormHandlers() {
    // Profile form handler
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }

    // Password form handler
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }

    // Preferences form handler
    const preferencesForm = document.getElementById('preferences-form');
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', handlePreferencesUpdate);
    }

    // Delete account handler
    const deleteButton = document.getElementById('delete-account');
    if (deleteButton) {
        deleteButton.addEventListener('click', handleDeleteAccount);
    }
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        submitButton.classList.add('loading');
        submitButton.textContent = 'Saving...';
        
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        const formData = new FormData(e.target);
        const updateData = {
            displayName: formData.get('displayName'),
            phone: formData.get('phone'),
            updatedAt: new Date()
        };

        // Update user profile in Firestore
        await collection(db, 'users', user.uid, updateData);
        
        // Update display name in Firebase Auth if changed
        if (updateData.displayName !== user.displayName) {
            await user.updateProfile({
                displayName: updateData.displayName
            });
        }

        showMessage('Profile updated successfully', 'success');
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('Error updating profile', 'error');
    } finally {
        submitButton.classList.remove('loading');
        submitButton.textContent = originalText;
    }
}

// Handle password change
async function handlePasswordChange(e) {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        submitButton.classList.add('loading');
        submitButton.textContent = 'Changing Password...';
        
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        const formData = new FormData(e.target);
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');

        // Validate passwords
        if (newPassword !== confirmPassword) {
            throw new Error('New passwords do not match');
        }

        if (newPassword.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        // Re-authenticate user before password change
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await user.reauthenticateWithCredential(credential);

        // Change password
        await user.updatePassword(newPassword);

        // Clear form
        e.target.reset();
        document.getElementById('password-strength').className = 'password-strength';

        showMessage('Password changed successfully', 'success');
        
    } catch (error) {
        console.error('Error changing password:', error);
        showMessage(error.message || 'Error changing password', 'error');
    } finally {
        submitButton.classList.remove('loading');
        submitButton.textContent = originalText;
    }
}

// Handle preferences update
async function handlePreferencesUpdate(e) {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        submitButton.classList.add('loading');
        submitButton.textContent = 'Saving Preferences...';
        
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        const formData = new FormData(e.target);
        const updateData = {
            language: formData.get('language'),
            theme: formData.get('theme'),
            notifications: formData.get('notifications') === 'on',
            updatedAt: new Date()
        };

        // Update user preferences in Firestore
        await collection(db, 'users', user.uid, updateData);

        // Update language if changed
        if (updateData.language !== currentLanguage) {
            changeLanguage(updateData.language);
        }

        showMessage('Preferences updated successfully', 'success');
        
    } catch (error) {
        console.error('Error updating preferences:', error);
        showMessage('Error updating preferences', 'error');
    } finally {
        submitButton.classList.remove('loading');
        submitButton.textContent = originalText;
    }
}

// Handle delete account
async function handleDeleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return;
    }

    try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        // Delete user data from Firestore
        await collection(db, 'users', user.uid);

        // Delete user account from Firebase Auth
        await user.delete();

        // Redirect to login page
        window.location.href = 'login.html';
        
    } catch (error) {
        console.error('Error deleting account:', error);
        showMessage('Error deleting account. Please try again.', 'error');
    }
}

// Set up password strength checker
function setupPasswordStrength() {
    const passwordInput = document.getElementById('newPassword');
    const strengthIndicator = document.getElementById('password-strength');
    
    if (passwordInput && strengthIndicator) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = checkPasswordStrength(password);
            
            // Remove all strength classes
            strengthIndicator.className = 'password-strength';
            
            // Add appropriate strength class
            if (strength > 0) {
                strengthIndicator.classList.add(strength);
            }
        });
    }
}

// Check password strength
function checkPasswordStrength(password) {
    if (password.length === 0) return '';
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Return strength level
    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    if (score <= 4) return 'strong';
    return 'very-strong';
}

// Show message
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at the top of the form
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        const form = activeTab.querySelector('form');
        if (form) {
            form.insertBefore(messageDiv, form.firstChild);
        }
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
} 
// Start the initialization process
initializeProfile();
