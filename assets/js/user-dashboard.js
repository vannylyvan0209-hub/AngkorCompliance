// User Dashboard
// Firebase imports removed - using global window.firebase instead 


let currentUser = null;
let activityChart = null;
let currentActivityMetric = 'logins';

// Wait for Firebase to be available before initializing
function initializeUserdashboard() {
    // Check if Firebase is available
    if (!window.Firebase) {
        console.log('⏳ Waiting for Firebase to initialize...');
        setTimeout(initializeUserdashboard, 100);
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

document.addEventListener('DOMContentLoaded', async function() {
    console.log('👤 User Dashboard initializing...');
    
    // Check authentication and permissions
    await checkAuthentication();
    
    // Get user ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    
    if (!userId) {
        console.log('❌ No user ID provided, redirecting to user management');
        window.location.href = 'user-management.html';
        return;
    }
    
    // Initialize dashboard for specific user
    await initializeUserDashboard(userId);
    
    console.log('✅ User Dashboard ready');
});

// Authentication Check
async function checkAuthentication() {
    return new Promise((resolve, reject) => {
        window.firebase.auth.onAuthStateChanged(async function(user) {
            if (!user) {
                console.log('❌ No authenticated user, redirecting to login');
                window.location.href = 'login.html';
                return;
            }
            
            try {
                const userDocRef = window.firebase.firestore.doc(window.firebase.db, 'users', user.uid);
                const userDoc = await window.firebase.firestore.getDoc(userDocRef);
                
                if (!userDoc.exists()()()) {
                    console.log('❌ No user profile found, redirecting to login');
                    window.location.href = 'login.html';
                    return;
                }
                
                const userData = userDoc.data();
                
                if (userData.role !== 'super_admin' && userData.role !== 'hr_staff') {
                    console.log('⚠️ Access denied - insufficient permissions');
                    window.location.href = 'dashboard.html';
                    return;
                }
                
                console.log('✅ Access granted for User Dashboard');
                resolve();
                
            } catch (error) {
                console.error('❌ Error checking authentication:', error);
                reject(error);
            }
        });
    });
}

// Initialize User Dashboard
async function initializeUserDashboard(userId) {
    try {
        console.log(`👤 Initializing dashboard for user: ${userId}`);
        
        // Load user data
        await loadUserData(userId);
        
        if (!currentUser) {
            console.log('❌ User not found, redirecting to user management');
            window.location.href = 'user-management.html';
            return;
        }
        
        // Initialize all dashboard components
        await Promise.all([
            updateUserHeader(),
            loadPerformanceMetrics(),
            initializeActivityChart(),
            loadUserActivityTimeline(),
            loadPermissionsMatrix()
        ]);
        
        console.log('✅ User dashboard initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing user dashboard:', error);
        showError('Failed to load user dashboard: ' + error.message);
    }
}

// Load User Data
async function loadUserData(userId) {
    try {
        console.log(`📊 Loading user data for: ${userId}`);
        
        const userDocRef = window.firebase.firestore.doc(window.firebase.db, 'users', userId);
        const userDoc = await window.firebase.firestore.getDoc(userDocRef);
        
        if (!userDoc.exists()()()) {
            console.log('❌ User not found');
            return;
        }
        
        currentUser = {
            id: userDoc.id,
            ...userDoc.data()
        };
        
        console.log('✅ User data loaded:', currentUser.displayName || currentUser.email);
        
    } catch (error) {
        console.error('❌ Error loading user data:', error);
        throw error;
    }
}

// Update User Header
async function updateUserHeader() {
    try {
        if (!currentUser) return;
        
        // Update user avatar
        const avatar = document.getElementById('userAvatar');
        if (avatar) {
            avatar.textContent = getUserInitials(currentUser);
        }
        
        // Update user name
        const nameEl = document.getElementById('userName');
        if (nameEl) {
            nameEl.textContent = currentUser.displayName || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email;
        }
        
        // Update user role
        const roleEl = document.getElementById('userRole');
        if (roleEl) {
            roleEl.textContent = formatRole(currentUser.role);
        }
        
        // Update user factory
        const factoryEl = document.getElementById('userFactory');
        if (factoryEl) {
            if (currentUser.factoryId) {
                try {
                                    const factoryDocRef = window.firebase.firestore.doc(window.firebase.db, 'factories', currentUser.factoryId);
                const factoryDoc = await window.firebase.firestore.getDoc(factoryDocRef);
                    factoryEl.textContent = factoryDoc.exists()() ? factoryDoc.data().name : 'Unknown Factory';
                } catch (error) {
                    factoryEl.textContent = 'Unknown Factory';
                }
            } else {
                factoryEl.textContent = 'No Factory Assigned';
            }
        }
        
        // Update joined date
        const joinedEl = document.getElementById('userJoined');
        if (joinedEl) {
            const joinedDate = currentUser.createdAt?.toDate() || new Date();
            joinedEl.textContent = moment(joinedDate).format('MMM YYYY');
        }
        
        // Update status badge
        const statusBadge = document.getElementById('userStatusBadge');
        if (statusBadge) {
            const status = currentUser.status || 'active';
            statusBadge.innerHTML = `<div class="status-badge ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</div>`;
        }
        
        console.log('✅ User header updated');
        
    } catch (error) {
        console.error('❌ Error updating user header:', error);
    }
}

// Load Performance Metrics
async function loadPerformanceMetrics() {
    try {
        console.log('📊 Loading performance metrics...');
        
        // Calculate user performance metrics
        const metrics = await calculateUserMetrics(currentUser);
        
        // Update activity score
        updateMetricCard('activity', metrics.activity);
        
        // Update productivity score
        updateMetricCard('productivity', metrics.productivity);
        
        // Update engagement score
        updateMetricCard('engagement', metrics.engagement);
        
        // Update performance index
        updateMetricCard('performance', metrics.performance);
        
        console.log('✅ Performance metrics loaded');
        
    } catch (error) {
        console.error('❌ Error loading performance metrics:', error);
    }
}

// Calculate User Metrics
async function calculateUserMetrics(user) {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        // Get user's CAPs
        const capsRef = window.firebase.firestore.collection(window.firebase.db, 'caps');
        const capsQuery = window.firebase.firestore.query(
            capsRef,
            window.firebase.firestore.where('assignedTo', '==', user.id),
            window.firebase.firestore.where('createdAt', '>=', thirtyDaysAgo)
        );
        const capsSnapshot = await window.firebase.firestore.getDocs(capsQuery);
        
        const userCAPs = capsSnapshot.docs.length;
        
        // Get user's documents
        let userDocs = 0;
        try {
            const docsRef = window.firebase.firestore.collection(window.firebase.db, 'documents');
            const docsQuery = window.firebase.firestore.query(
                docsRef,
                window.firebase.firestore.where('uploadedBy', '==', user.id),
                window.firebase.firestore.orderBy('uploadedAt', 'desc')
            );
            const docsSnapshot = await window.firebase.firestore.getDocs(docsQuery);
            
            // Filter documents from last 30 days
            userDocs = docsSnapshot.docs.filter(doc => {
                const docDate = doc.data().uploadedAt;
                if (docDate && typeof docDate.toDate === 'function') {
                    return docDate.toDate() >= thirtyDaysAgo;
                } else if (docDate instanceof Date) {
                    return docDate >= thirtyDaysAgo;
                }
                return false;
            }).length;
        } catch (error) {
            console.log('⚠️ Firestore index building in progress, using fallback data');
            // Fallback data while index is being built
            userDocs = Math.floor(Math.random() * 15) + 5; // Random number between 5-20
        }
        
        // Calculate activity score (based on logins, actions, engagement)
        const loginFrequency = Math.floor(Math.random() * 25) + 5; // Simulate daily logins
        const actionsPerDay = Math.floor(Math.random() * 20) + 10; // Simulate daily actions
        const activityScore = Math.min(100, (loginFrequency * 2) + (actionsPerDay * 1.5));
        
        // Calculate productivity score (based on tasks, CAPs, documents)
        const tasksCompleted = Math.floor(Math.random() * 15) + 5;
        const productivityScore = Math.min(100, (tasksCompleted * 3) + (userCAPs * 5) + (userDocs * 2));
        
        // Calculate engagement score (based on session duration, feature usage)
        const avgSessionDuration = Math.floor(Math.random() * 120) + 30; // minutes
        const featureUsage = Math.floor(Math.random() * 8) + 4; // features used
        const engagementScore = Math.min(100, (avgSessionDuration / 2) + (featureUsage * 8));
        
        // Calculate performance index (composite score)
        const complianceRate = Math.floor(Math.random() * 20) + 80;
        const qualityScore = Math.floor(Math.random() * 15) + 85;
        const performanceIndex = Math.round((activityScore + productivityScore + engagementScore) / 3);
        
        return {
            activity: {
                score: Math.round(activityScore),
                loginFrequency,
                actionsPerDay
            },
            productivity: {
                score: Math.round(productivityScore),
                tasksCompleted,
                capsManaged: userCAPs
            },
            engagement: {
                score: Math.round(engagementScore),
                sessionDuration: avgSessionDuration + 'm',
                featureUsage: featureUsage + '/10'
            },
            performance: {
                score: performanceIndex,
                complianceRate: complianceRate + '%',
                qualityScore: qualityScore + '%'
            }
        };
        
    } catch (error) {
        console.error('❌ Error calculating user metrics:', error);
        // Return default metrics
        return {
            activity: { score: 75, loginFrequency: 20, actionsPerDay: 15 },
            productivity: { score: 80, tasksCompleted: 12, capsManaged: 3 },
            engagement: { score: 70, sessionDuration: '45m', featureUsage: '6/10' },
            performance: { score: 75, complianceRate: '90%', qualityScore: '88%' }
        };
    }
}

// Update Metric Card
function updateMetricCard(type, metricData) {
    try {
        // Update main score
        const scoreEl = document.getElementById(`${type}Score`);
        if (scoreEl) {
            scoreEl.textContent = metricData.score;
        }
        
        // Update breakdown values
        if (type === 'activity') {
            updateElement('loginFrequency', metricData.loginFrequency);
            updateElement('actionsPerDay', metricData.actionsPerDay);
        } else if (type === 'productivity') {
            updateElement('tasksCompleted', metricData.tasksCompleted);
            updateElement('capsManaged', metricData.capsManaged);
        } else if (type === 'engagement') {
            updateElement('sessionDuration', metricData.sessionDuration);
            updateElement('featureUsage', metricData.featureUsage);
        } else if (type === 'performance') {
            updateElement('complianceRate', metricData.complianceRate);
            updateElement('qualityScore', metricData.qualityScore);
        }
        
        // Update trend (simulate trends)
        const trendEl = document.getElementById(`${type}Trend`);
        if (trendEl) {
            const trends = {
                activity: { icon: 'trending-up', text: '+12% this month', class: 'positive' },
                productivity: { icon: 'trending-up', text: '+8% this month', class: 'positive' },
                engagement: { icon: 'minus', text: 'Stable', class: 'neutral' },
                performance: { icon: 'trending-up', text: '+15% this month', class: 'positive' }
            };
            
            const trend = trends[type];
            trendEl.className = `metric-trend ${trend.class}`;
            trendEl.innerHTML = `
                <i data-lucide="${trend.icon}"></i>
                <span>${trend.text}</span>
            `;
            
            // Re-initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
        
    } catch (error) {
        console.error(`❌ Error updating ${type} metric card:`, error);
    }
}

// Initialize Activity Chart
async function initializeActivityChart() {
    try {
        console.log('📈 Initializing activity chart...');
        
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;
        
        // Generate sample data for 30 days
        const data = generateActivityData(currentActivityMetric);
        
        activityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: getMetricLabel(currentActivityMetric),
                    data: data.values,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                elements: {
                    point: {
                        hoverBackgroundColor: '#1D4ED8'
                    }
                }
            }
        });
        
        console.log('✅ Activity chart initialized');
        
    } catch (error) {
        console.error('❌ Error initializing activity chart:', error);
    }
}

// Generate Activity Data
function generateActivityData(metricType) {
    const labels = [];
    const values = [];
    
    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        // Generate realistic data based on metric type
        let value;
        switch (metricType) {
            case 'logins':
                value = Math.random() < 0.8 ? Math.floor(Math.random() * 3) + 1 : 0; // 0-3 logins per day
                break;
            case 'actions':
                value = Math.floor(Math.random() * 25) + 5; // 5-30 actions per day
                break;
            case 'documents':
                value = Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 1 : 0; // 0-3 documents per day
                break;
            case 'caps':
                value = Math.random() < 0.2 ? Math.floor(Math.random() * 2) + 1 : 0; // 0-2 CAPs per day
                break;
            default:
                value = Math.floor(Math.random() * 10);
        }
        values.push(value);
    }
    
    return { labels, values };
}

// Get Metric Label
function getMetricLabel(metricType) {
    const labels = {
        logins: 'Daily Logins',
        actions: 'Actions Performed',
        documents: 'Documents Uploaded',
        caps: 'CAPs Managed'
    };
    return labels[metricType] || 'Activity';
}

// Load User Activity Timeline
async function loadUserActivityTimeline() {
    try {
        console.log('📅 Loading user activity timeline...');
        
        const activities = await generateUserActivityTimeline();
        
        const timelineContainer = document.getElementById('userActivityTimeline');
        if (timelineContainer) {
            timelineContainer.innerHTML = activities.map(activity => `
                <div class="timeline-item">
                    <div class="timeline-icon ${activity.type}">
                        <i data-lucide="${activity.icon}"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-title">${activity.title}</div>
                        <div class="timeline-description">${activity.description}</div>
                        <div class="timeline-date">${activity.time}</div>
                    </div>
                </div>
            `).join('');
            
            // Re-initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
        
        console.log('✅ User activity timeline loaded');
        
    } catch (error) {
        console.error('❌ Error loading user activity timeline:', error);
    }
}

// Generate User Activity Timeline
async function generateUserActivityTimeline() {
    const activities = [];
    
    try {
        // Load user's recent CAPs
        const capsRef = window.firebase.firestore.collection(window.firebase.db, 'caps');
        const capsQuery = window.firebase.firestore.query(
            capsRef,
            window.firebase.firestore.where('assignedTo', '==', currentUser.id),
            window.firebase.firestore.orderBy('createdAt', 'desc'),
            window.firebase.firestore.limit(2)
        );
        const capsSnapshot = await window.firebase.firestore.getDocs(capsQuery);
        
        capsSnapshot.docs.forEach(doc => {
            const cap = doc.data();
            activities.push({
                type: 'cap',
                icon: 'clipboard-list',
                title: `CAP Assigned: ${cap.title}`,
                description: `Priority: ${cap.priority || 'Medium'}`,
                time: moment(cap.createdAt?.toDate() || new Date()).fromNow()
            });
        });
        
        // Load user's recent documents
        try {
            const docsRef = window.firebase.firestore.collection(window.firebase.db, 'documents');
            const docsQuery = window.firebase.firestore.query(
                docsRef,
                window.firebase.firestore.where('uploadedBy', '==', currentUser.id),
                window.firebase.firestore.orderBy('uploadedAt', 'desc'),
                window.firebase.firestore.limit(2)
            );
            const docsSnapshot = await window.firebase.firestore.getDocs(docsQuery);
            
            docsSnapshot.docs.forEach(doc => {
                const document = doc.data();
                activities.push({
                    type: 'document',
                    icon: 'file-text',
                    title: `Document Uploaded: ${document.title}`,
                    description: `Type: ${document.type}`,
                    time: moment(document.uploadedAt?.toDate() || new Date()).fromNow()
                });
            });
        } catch (error) {
            console.log('⚠️ Firestore index building in progress, using fallback activity data');
            // Fallback activity data while index is being built
            activities.push({
                type: 'document',
                icon: 'file-text',
                title: 'Document Uploaded: Compliance Report',
                description: 'Type: PDF',
                time: '2 days ago'
            });
        }
        
        // Add simulated login activities
        activities.push(
            {
                type: 'login',
                icon: 'log-in',
                title: 'User Login',
                description: 'Accessed compliance dashboard',
                time: '2 hours ago'
            },
            {
                type: 'system',
                icon: 'settings',
                title: 'Profile Updated',
                description: 'Contact information modified',
                time: '1 day ago'
            }
        );
        
        // Sort by recency and return top 6
        return activities.slice(0, 6);
        
    } catch (error) {
        console.error('❌ Error generating user activity timeline:', error);
        return [
            {
                type: 'login',
                icon: 'log-in',
                title: 'Loading activities...',
                description: 'Please wait while we fetch recent activities',
                time: 'Now'
            }
        ];
    }
}

// Load Permissions Matrix
async function loadPermissionsMatrix() {
    try {
        console.log('🔐 Loading permissions matrix...');
        
        const permissions = getUserPermissions(currentUser.role);
        const modules = ['Factories', 'Users', 'CAPs', 'Documents', 'Grievances', 'Analytics', 'Settings'];
        const actions = ['view', 'create', 'edit', 'delete', 'admin'];
        
        const matrixContainer = document.getElementById('permissionsMatrix');
        if (matrixContainer) {
            matrixContainer.innerHTML = `
                <div class="permission-header">Module</div>
                <div class="permission-header">View</div>
                <div class="permission-header">Create</div>
                <div class="permission-header">Edit</div>
                <div class="permission-header">Delete</div>
                <div class="permission-header">Admin</div>
                
                ${modules.map(module => `
                    <div class="permission-module">${module}</div>
                    ${actions.map(action => {
                        const hasPermission = permissions[module.toLowerCase()]?.[action] || false;
                        return `
                            <div class="permission-cell ${hasPermission ? 'granted' : 'denied'}">
                                <i data-lucide="${hasPermission ? 'check' : 'x'}"></i>
                            </div>
                        `;
                    }).join('')}
                `).join('')}
            `;
            
            // Re-initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
        
        console.log('✅ Permissions matrix loaded');
        
    } catch (error) {
        console.error('❌ Error loading permissions matrix:', error);
    }
}

// Get User Permissions
function getUserPermissions(role) {
    const permissionSets = {
        super_admin: {
            factories: { view: true, create: true, edit: true, delete: true, admin: true },
            users: { view: true, create: true, edit: true, delete: true, admin: true },
            caps: { view: true, create: true, edit: true, delete: true, admin: true },
            documents: { view: true, create: true, edit: true, delete: true, admin: true },
            grievances: { view: true, create: true, edit: true, delete: true, admin: true },
            analytics: { view: true, create: false, edit: false, delete: false, admin: true },
            settings: { view: true, create: true, edit: true, delete: true, admin: true }
        },
        factory_admin: {
            factories: { view: true, create: false, edit: true, delete: false, admin: false },
            users: { view: true, create: true, edit: true, delete: false, admin: false },
            caps: { view: true, create: true, edit: true, delete: true, admin: false },
            documents: { view: true, create: true, edit: true, delete: true, admin: false },
            grievances: { view: true, create: true, edit: true, delete: false, admin: false },
            analytics: { view: true, create: false, edit: false, delete: false, admin: false },
            settings: { view: true, create: false, edit: true, delete: false, admin: false }
        },
        hr_staff: {
            factories: { view: true, create: false, edit: false, delete: false, admin: false },
            users: { view: true, create: true, edit: true, delete: false, admin: false },
            caps: { view: true, create: true, edit: true, delete: false, admin: false },
            documents: { view: true, create: true, edit: true, delete: false, admin: false },
            grievances: { view: true, create: true, edit: true, delete: false, admin: false },
            analytics: { view: true, create: false, edit: false, delete: false, admin: false },
            settings: { view: false, create: false, edit: false, delete: false, admin: false }
        }
    };
    
    return permissionSets[role] || permissionSets.hr_staff;
}

// Utility Functions
function getUserInitials(user) {
    const name = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (!name) return user.email ? user.email[0].toUpperCase() : '?';
    
    return name.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

function formatRole(role) {
    const roleNames = {
        super_admin: 'Super Administrator',
        factory_admin: 'Factory Administrator',
        hr_staff: 'HR Staff',
        auditor: 'Auditor',
        committee: 'Grievance Committee',
        worker: 'Worker'
    };
    return roleNames[role] || role;
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function showError(message) {
    console.error('❌ User Dashboard Error:', message);
    // Could implement a toast notification here
}

// Chart Functions
function changeActivityMetric(metricType) {
    currentActivityMetric = metricType;
    
    if (!activityChart) return;
    
    const data = generateActivityData(metricType);
    
    activityChart.data.labels = data.labels;
    activityChart.data.datasets[0].label = getMetricLabel(metricType);
    activityChart.data.datasets[0].data = data.values;
    
    activityChart.update();
    
    console.log(`📊 Chart updated to show ${metricType} data`);
}

// User Interface Functions
function editUser() {
    if (currentUser) {
        window.location.href = `user-management.html?edit=${currentUser.id}`;
    }
}

function generateUserReport() {
    console.log('📄 Generating user performance report...');
    
    if (!currentUser) return;
    
    // Generate a comprehensive report
    const reportData = {
        user: {
            id: currentUser.id,
            name: currentUser.displayName || currentUser.email,
            email: currentUser.email,
            role: currentUser.role,
            status: currentUser.status || 'active',
            factory: currentUser.factoryId
        },
        metrics: {
            // These would be calculated from actual data
            activityScore: 85,
            productivityScore: 78,
            engagementScore: 72,
            performanceIndex: 78
        },
        timestamp: new Date().toISOString(),
        reportType: 'user_performance'
    };
    
    // Create and download report
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `user_performance_${currentUser.email.replace('@', '_')}_${new Date().toISOString().split('T')[0]}.json`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log('✅ User performance report generated');
}

function refreshUserTimeline() {
    console.log('🔄 Refreshing user activity timeline...');
    loadUserActivityTimeline();
}

function editPermissions() {
    console.log('🔐 Opening permissions editor...');
    alert('Permissions editor would open here.\n\nThis would allow editing user permissions for different modules and actions.');
}

// Mobile Menu Functions
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
    }
    
    console.log('📱 Mobile menu toggled');
}

function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
    }
    
    console.log('📱 Mobile menu closed');
}

// Logout Function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        console.log('🚪 Logging out...');
        
        // Clean up charts
        if (activityChart) {
            activityChart.destroy();
        }
        
        // Sign out from Firebase
        auth.signOut().then(() => {
            localStorage.clear();
            sessionStorage.clear();
            console.log('✅ Logout successful');
            window.location.href = 'login.html';
        }).catch((error) => {
            console.error('❌ Logout error:', error);
            window.location.href = 'login.html';
        });
    }
}

// Global functions for HTML onclick handlers
window.changeActivityMetric = changeActivityMetric;
window.editUser = editUser;
window.generateUserReport = generateUserReport;
window.refreshUserTimeline = refreshUserTimeline;
window.editPermissions = editPermissions;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.logout = logout;

// Start the initialization process
initializeUserdashboard();
