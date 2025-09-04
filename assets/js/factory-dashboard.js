// Factory Performance Dashboard
// Wait for Firebase to be available before initializing
function initializeFactoryDashboard() {
  // Check if Firebase is available
  if (!window.Firebase) {
    console.log('⏳ Waiting for Firebase to initialize...');
    setTimeout(initializeFactoryDashboard, 100);
    return;
  }

  // Get Firebase instances and functions from the global Firebase object
  const { auth, db } = window.Firebase;
  const {
    doc, 
    getDoc, 
    collection, 
    query, 
    where, 
    orderBy, 
    limit, 
    getDocs 
  } = window.Firebase;

  let currentFactory = null;
  let trendsChart = null;
  let currentMetricType = 'compliance';

  document.addEventListener('DOMContentLoaded', async function() {
    console.log('🏭 Factory Dashboard initializing...');
    
    // Check authentication and permissions
    await checkAuthentication();
    
    // Get factory ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    let factoryId = urlParams.get('id');
    
    if (!factoryId) {
      // If no explicit factoryId in URL, try to use the assigned factory for factory admins
      if (window.assignedFactoryId) {
        factoryId = window.assignedFactoryId;
      } else {
        console.log('❌ No factory ID provided, redirecting to dashboard');
        window.location.href = 'dashboard.html';
        return;
      }
    }
    
    // Initialize dashboard for specific factory
    await initializeFactoryDashboard(factoryId);
    
    console.log('✅ Factory Dashboard ready');
  });

// Authentication Check
async function checkAuthentication() {
    return new Promise((resolve, reject) => {
        auth.onAuthStateChanged(async function(user) {
            if (!user) {
                console.log('❌ No authenticated user, redirecting to login');
                window.location.href = 'login.html';
                return;
            }
            
            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (!userDoc.exists()) {
                    console.log('❌ No user profile found, redirecting to login');
                    window.location.href = 'login.html';
                    return;
                }
                
                const userData = userDoc.data();

                // Persist role/name for navigation rendering on direct visits
                try {
                    if (typeof localStorage !== 'undefined') {
                        localStorage.setItem('userRole', userData.role || 'user');
                        localStorage.setItem('userName', userData.name || user.displayName || '');
                    }
                } catch (e) { /* noop */ }

                // Allow Super Admins and Factory Admins
                if (userData.role !== 'super_admin' && userData.role !== 'factory_admin') {
                    console.log('⚠️ Access denied - insufficient permissions');
                    window.location.href = 'dashboard.html';
                    return;
                }
                
                // Expose assigned factory for factory admins
                if (userData.role === 'factory_admin' && userData.factoryId) {
                    window.assignedFactoryId = userData.factoryId;
                }

                // If navigation already initialized with a wrong default, update it now
                try {
                    if (window.NavigationConfig && window.NavigationConfig.methods && window.superAdminNav) {
                        const items = window.NavigationConfig.methods.getNavigationForRole
                            .call(window.NavigationConfig, userData.role || 'user')
                            .map(item => ({
                                id: item.id,
                                title: item.title,
                                icon: item.icon,
                                url: item.url,
                                description: item.description
                            }));
                        if (Array.isArray(items) && items.length) {
                            window.superAdminNav.updateNavigation(items);
                            // Update portal subtitle to reflect correct role
                            if (typeof window.superAdminNav.updatePortalSubtitle === 'function') {
                                window.superAdminNav.updatePortalSubtitle();
                            }
                        }
                    }
                } catch (e) {
                    console.warn('Navigation refresh skipped:', e);
                }
                
                console.log('✅ Access granted for Factory Dashboard');
                resolve();
                
            } catch (error) {
                console.error('❌ Error checking authentication:', error);
                reject(error);
            }
        });
    });
}

// Initialize Factory Dashboard
async function initializeFactoryDashboard(factoryId) {
    try {
        console.log(`🏭 Initializing dashboard for factory: ${factoryId}`);
        
        // Load factory data
        await loadFactoryData(factoryId);
        
        if (!currentFactory) {
            console.log('❌ Factory not found, redirecting to factory management');
            window.location.href = 'factory-management.html';
            return;
        }
        
        // Initialize all dashboard components
        await Promise.all([
            updateFactoryHeader(),
            loadPerformanceMetrics(),
            initializeTrendsChart(),
            loadActivityTimeline()
        ]);
        
        console.log('✅ Factory dashboard initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing factory dashboard:', error);
        showError('Failed to load factory dashboard: ' + error.message);
    }
}

// Load Factory Data
async function loadFactoryData(factoryId) {
    try {
        console.log(`📊 Loading factory data for: ${factoryId}`);
        
        const factoryDocRef = doc(db, 'factories', factoryId);
        const factoryDoc = await getDoc(factoryDocRef);
        
        if (!factoryDoc.exists()) {
            console.log('❌ Factory not found');
            return;
        }
        
        currentFactory = {
            id: factoryDoc.id,
            ...factoryDoc.data()
        };
        
        console.log('✅ Factory data loaded:', currentFactory.name);
        
    } catch (error) {
        console.error('❌ Error loading factory data:', error);
        throw error;
    }
}

// Update Factory Header
async function updateFactoryHeader() {
    try {
        if (!currentFactory) return;
        
        // Update factory avatar
        const avatar = document.getElementById('factoryAvatar');
        if (avatar) {
            avatar.textContent = getFactoryInitials(currentFactory);
        }
        
        // Update factory name
        const nameEl = document.getElementById('factoryName');
        if (nameEl) {
            nameEl.textContent = currentFactory.name || 'Unknown Factory';
        }
        
        // Update factory location
        const locationEl = document.getElementById('factoryLocation');
        if (locationEl) {
            const location = formatLocation(currentFactory);
            locationEl.textContent = location;
        }
        
        // Update employee count
        const employeesEl = document.getElementById('factoryEmployees');
        if (employeesEl) {
            employeesEl.textContent = currentFactory.employeeCount || 'Unknown';
        }
        
        // Update established date
        const establishedEl = document.getElementById('factoryEstablished');
        if (establishedEl) {
            const established = currentFactory.establishedDate || currentFactory.createdAt;
            if (established) {
                const date = established.toDate ? established.toDate() : new Date(established);
                establishedEl.textContent = date.getFullYear();
            } else {
                establishedEl.textContent = 'Unknown';
            }
        }
        
        console.log('✅ Factory header updated');
        
    } catch (error) {
        console.error('❌ Error updating factory header:', error);
    }
}

// Load Performance Metrics
async function loadPerformanceMetrics() {
    try {
        console.log('📊 Loading performance metrics...');
        
        // Calculate or get performance metrics
        const metrics = calculatePerformanceMetrics(currentFactory);
        
        // Update compliance score
        updateMetricCard('compliance', metrics.compliance);
        
        // Update performance score
        updateMetricCard('performance', metrics.performance);
        
        // Update safety score
        updateMetricCard('safety', metrics.safety);
        
        // Update productivity score
        updateMetricCard('productivity', metrics.productivity);
        
        console.log('✅ Performance metrics loaded');
        
    } catch (error) {
        console.error('❌ Error loading performance metrics:', error);
    }
}

// Calculate Performance Metrics
function calculatePerformanceMetrics(factory) {
    // Get base compliance score
    const complianceScore = factory.complianceScore || 0;
    
    // Calculate performance score (simulate based on various factors)
    const performanceScore = Math.min(100, complianceScore + (Math.random() * 20 - 10));
    
    // Calculate safety score (simulate)
    const safetyScore = Math.min(100, Math.max(0, complianceScore + (Math.random() * 30 - 15)));
    
    // Calculate productivity score (simulate)
    const productivityScore = Math.min(100, Math.max(0, complianceScore + (Math.random() * 25 - 12)));
    
    return {
        compliance: Math.round(complianceScore),
        performance: Math.round(performanceScore),
        safety: Math.round(safetyScore),
        productivity: Math.round(productivityScore)
    };
}

// Update Metric Card
function updateMetricCard(type, score) {
    try {
        // Update score display
        const scoreEl = document.getElementById(`${type}Score`);
        if (scoreEl) {
            scoreEl.textContent = score;
        }
        
        // Update percentage display
        const percentEl = document.getElementById(`${type}Percent`);
        if (percentEl) {
            percentEl.textContent = score + '%';
        }
        
        // Update progress circle
        const circle = document.getElementById(`${type}Circle`);
        if (circle) {
            const circumference = 2 * Math.PI * 36; // radius = 36
            const offset = circumference - (score / 100) * circumference;
            circle.style.strokeDasharray = circumference;
            circle.style.strokeDashoffset = offset;
            
            // Update color based on score
            let color;
            if (score >= 90) color = 'var(--success-500)';
            else if (score >= 70) color = 'var(--warning-500)';
            else color = 'var(--danger-500)';
            
            circle.style.stroke = color;
        }
        
        // Update trend indicator
        const trendEl = document.getElementById(`${type}Trend`);
        if (trendEl) {
            // Simulate trend (in real app, this would be calculated from historical data)
            const trends = [
                { icon: 'trending-up', text: '+5.2% this month', class: 'positive' },
                { icon: 'trending-up', text: '+2.8% this month', class: 'positive' },
                { icon: 'minus', text: 'No change', class: 'neutral' },
                { icon: 'trending-up', text: '+8.1% this month', class: 'positive' }
            ];
            
            const trendIndex = ['compliance', 'performance', 'safety', 'productivity'].indexOf(type);
            const trend = trends[trendIndex] || trends[0];
            
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

// Initialize Trends Chart
async function initializeTrendsChart() {
    try {
        console.log('📈 Initializing trends chart...');
        
        // Check if Chart.js is available, wait if not
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        while (typeof Chart === 'undefined' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (typeof Chart === 'undefined') {
            console.log('⚠️ Chart.js not available after waiting, skipping chart initialization');
            return;
        }
        
        const ctx = document.getElementById('trendsChart');
        if (!ctx) return;
        
        // Generate sample data for 6 months
        const labels = [];
        const data = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
            
            // Generate realistic trend data
            const baseScore = currentFactory?.complianceScore || 75;
            const variation = (Math.random() - 0.5) * 20;
            data.push(Math.max(0, Math.min(100, baseScore + variation)));
        }
        
        trendsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Compliance Score',
                    data: data,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
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
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
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
        
        console.log('✅ Trends chart initialized');
        
    } catch (error) {
        console.error('❌ Error initializing trends chart:', error);
    }
}

// Load Activity Timeline
async function loadActivityTimeline() {
    try {
        console.log('📅 Loading activity timeline...');
        
        // Simulate loading related activities
        const activities = await generateTimelineActivities();
        
        const timelineContainer = document.getElementById('activityTimeline');
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
        
        console.log('✅ Activity timeline loaded');
        
    } catch (error) {
        console.error('❌ Error loading activity timeline:', error);
    }
}

// Generate Timeline Activities
async function generateTimelineActivities() {
    const activities = [];
    
    try {
        // Load related CAPs
        const capsRef = collection(db, 'caps');
        const capsQuery = query(
            capsRef,
            where('factoryId', '==', currentFactory.id),
            orderBy('createdAt', 'desc'),
            limit(3)
        );
        const capsSnapshot = await getDocs(capsQuery);
        
        capsSnapshot.docs.forEach(doc => {
            const cap = doc.data();
            activities.push({
                type: 'audit',
                icon: 'clipboard-list',
                title: `CAP Created: ${cap.title}`,
                description: `Priority: ${cap.priority || 'Medium'}`,
                time: moment(cap.createdAt?.toDate() || new Date()).fromNow()
            });
        });
        
        // Load related documents
        const docsRef = collection(db, 'documents');
        const docsQuery = query(
            docsRef,
            where('factoryId', '==', currentFactory.id),
            orderBy('uploadedAt', 'desc'),
            limit(2)
        );
        const docsSnapshot = await getDocs(docsQuery);
        
        docsSnapshot.docs.forEach(doc => {
            const document = doc.data();
            activities.push({
                type: 'improvement',
                icon: 'file-text',
                title: `Document Uploaded: ${document.title}`,
                description: `Type: ${document.type}`,
                time: moment(document.uploadedAt?.toDate() || new Date()).fromNow()
            });
        });
        
        // Add some simulated activities if we don't have enough real data
        if (activities.length < 3) {
            activities.push(
                {
                    type: 'audit',
                    icon: 'search',
                    title: 'Compliance Audit Completed',
                    description: 'Annual compliance review conducted',
                    time: '2 days ago'
                },
                {
                    type: 'improvement',
                    icon: 'trending-up',
                    title: 'Performance Improvement',
                    description: 'Safety protocols updated',
                    time: '1 week ago'
                },
                {
                    type: 'issue',
                    icon: 'alert-triangle',
                    title: 'Minor Issue Resolved',
                    description: 'Equipment maintenance completed',
                    time: '2 weeks ago'
                }
            );
        }
        
        // Sort by recency and return top 6
        return activities.slice(0, 6);
        
    } catch (error) {
        console.error('❌ Error generating timeline activities:', error);
        return [
            {
                type: 'audit',
                icon: 'search',
                title: 'Loading activities...',
                description: 'Please wait while we fetch recent activities',
                time: 'Now'
            }
        ];
    }
}

// Change Metric Type in Chart
function changeMetricType(metricType) {
    currentMetricType = metricType;
    
    if (!trendsChart) return;
    
    // Update chart data based on metric type
    const newData = generateMetricTrendData(metricType);
    const colors = {
        compliance: '#10B981',
        performance: '#3B82F6',
        safety: '#F59E0B',
        productivity: '#8B5CF6'
    };
    
    const color = colors[metricType] || '#3B82F6';
    
    trendsChart.data.datasets[0].label = metricType.charAt(0).toUpperCase() + metricType.slice(1) + ' Score';
    trendsChart.data.datasets[0].data = newData;
    trendsChart.data.datasets[0].borderColor = color;
    trendsChart.data.datasets[0].backgroundColor = color + '20';
    trendsChart.data.datasets[0].pointBackgroundColor = color;
    
    trendsChart.update();
    
    console.log(`📊 Chart updated to show ${metricType} trends`);
}

// Generate Metric Trend Data
function generateMetricTrendData(metricType) {
    const data = [];
    const baseScore = calculatePerformanceMetrics(currentFactory)[metricType] || 75;
    
    for (let i = 5; i >= 0; i--) {
        const variation = (Math.random() - 0.5) * 20;
        const trendEffect = i * 2; // Slight upward trend
        data.push(Math.max(0, Math.min(100, baseScore + variation + trendEffect)));
    }
    
    return data;
}

// Utility Functions
function getFactoryInitials(factory) {
    const name = factory.name || 'Factory';
    return name.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

function formatLocation(factory) {
    const parts = [factory.city, factory.province, factory.country].filter(Boolean);
    return parts.join(', ') || 'No location specified';
}

function showError(message) {
    console.error('❌ Factory Dashboard Error:', message);
    // Could implement a toast notification here
}

// User Interface Functions
function editFactory() {
    if (currentFactory) {
        window.location.href = `factory-management.html?edit=${currentFactory.id}`;
    }
}

function generateReport() {
    console.log('📄 Generating factory performance report...');
    
    if (!currentFactory) return;
    
    // Generate a comprehensive report
    const reportData = {
        factory: currentFactory,
        metrics: calculatePerformanceMetrics(currentFactory),
        timestamp: new Date().toISOString(),
        reportType: 'performance_dashboard'
    };
    
    // Create and download report
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `factory_performance_${currentFactory.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log('✅ Factory performance report generated');
}

function refreshTimeline() {
    console.log('🔄 Refreshing activity timeline...');
    loadActivityTimeline();
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
        if (trendsChart) {
            trendsChart.destroy();
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
window.changeMetricType = changeMetricType;
window.editFactory = editFactory;
window.generateReport = generateReport;
window.refreshTimeline = refreshTimeline;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.logout = logout;
}

// Start the initialization process
initializeFactoryDashboard();
