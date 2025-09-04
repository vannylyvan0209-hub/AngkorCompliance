// CAP Analytics Dashboard
let caps = [];
let factories = [];
let timelineChart = null;
let currentTimelineMetric = 'completion';
let unsubscribeCaps = null;
let unsubscribeFactories = null;
let analyticsFilters = {
    timePeriod: 30,
    factory: 'all',
    priority: 'all',
    status: 'all',
    dateMode: 'createdAt',
    category: 'all',
    riskImpact: null,
    riskProbability: null
};

// Wait for Firebase to be available before initializing
function initializeCapanalytics() {
    // Check if Firebase is available
    if (!window.Firebase) {
        console.log('⏳ Waiting for Firebase to initialize...');
        setTimeout(initializeCapanalytics, 100);
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
    console.log('📊 CAP Analytics Dashboard initializing...');
    
    // Check authentication and permissions
    await checkAuthentication();
    
    // Initialize analytics dashboard
    await initializeAnalytics();
    
    console.log('✅ CAP Analytics Dashboard ready');
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
                const userDoc = await collection(db, 'users', user.uid);
                
                if (!userDoc.exists()()) {
                    console.log('❌ No user profile found, redirecting to login');
                    window.location.href = 'login.html';
                    return;
                }
                
                const userData = userDoc.data();
                
                if (userData.role !== 'super_admin') {
                    console.log('⚠️ Access denied - insufficient permissions');
                    window.location.href = 'dashboard.html';
                    return;
                }
                
                console.log('✅ Super Admin access granted for CAP Analytics');
                resolve();
                
            } catch (error) {
                console.error('❌ Error checking authentication:', error);
                reject(error);
            }
        });
    });
}

// Initialize Analytics Dashboard
async function initializeAnalytics() {
    try {
        console.log('📊 Initializing CAP analytics...');
        
        // Load data first, then populate filters that depend on the data
        await Promise.all([
            loadCAPsData(),
            loadFactoriesData()
        ]);
        await populateFilters();
        
        // Initialize all analytics components
        await Promise.all([
            calculateKPIs(),
            initializeTimelineChart(),
            generateRiskMatrix(),
            analyzeFactoryPerformance()
        ]);
        
        // Start real-time listeners
        startRealTimeListeners();
        
        console.log('✅ CAP analytics initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing CAP analytics:', error);
        showError('Failed to load analytics: ' + error.message);
    }
}

// Load CAPs Data
async function loadCAPsData() {
    try {
        console.log('📋 Loading CAPs data...');
        
        const snapshot = await collection(db, 'caps');
        caps = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: safeToDate(doc.data().createdAt),
            dueDate: safeToDate(doc.data().dueDate),
            updatedAt: safeToDate(doc.data().updatedAt),
            completedAt: safeToDate(doc.data().completedAt),
            riskImpact: typeof doc.data().riskImpact === 'number' ? doc.data().riskImpact : null,
            riskProbability: typeof doc.data().riskProbability === 'number' ? doc.data().riskProbability : null,
            category: doc.data().category || null,
            status: doc.data().status || null,
            priority: doc.data().priority || null
        }));
        
        console.log(`✅ Loaded ${caps.length} CAPs for analysis`);
        
    } catch (error) {
        console.error('❌ Error loading CAPs data:', error);
        throw error;
    }
}

// Load Factories Data
async function loadFactoriesData() {
    try {
        console.log('🏭 Loading factories data...');
        
        const snapshot = await collection(db, 'factories');
        factories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log(`✅ Loaded ${factories.length} factories for analysis`);
        
    } catch (error) {
        console.error('❌ Error loading factories data:', error);
        throw error;
    }
}

// Populate Filter Options
async function populateFilters() {
    try {
        // Populate factory filter
        const factoryFilter = document.getElementById('factoryFilter');
        if (factoryFilter) {
            const current = factoryFilter.value || 'all';
            factoryFilter.innerHTML = '<option value="all">All Factories</option>';
            factories.forEach(factory => {
                const option = document.createElement('option');
                option.value = factory.id;
                option.textContent = factory.name;
                factoryFilter.appendChild(option);
            });
            factoryFilter.value = current;
        }
        
        // Populate category filter (derive from CAPs)
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            const currentCat = categoryFilter.value || 'all';
            categoryFilter.innerHTML = '<option value="all">All Categories</option>';
            const categories = Array.from(new Set(caps.map(c => c.category).filter(Boolean))).sort();
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                categoryFilter.appendChild(option);
            });
            categoryFilter.value = currentCat;
        }
        
        console.log('✅ Filters populated');
        
    } catch (error) {
        console.error('❌ Error populating filters:', error);
    }
}

// Calculate KPIs
async function calculateKPIs() {
    try {
        console.log('📊 Calculating KPIs...');
        
        const filteredCAPs = getFilteredCAPs();
        const now = new Date();
        
        // Completion Rate
        const completedCAPs = filteredCAPs.filter(cap => cap.status === 'completed').length;
        const completionRate = filteredCAPs.length > 0 ? (completedCAPs / filteredCAPs.length * 100) : 0;
        
        // Efficiency Score (based on completion time vs due date)
        const completedOnTime = filteredCAPs.filter(cap => 
            cap.status === 'completed' && 
            cap.completedAt && 
            cap.dueDate && 
            cap.completedAt <= cap.dueDate
        ).length;
        const efficiencyScore = completedCAPs > 0 ? (completedOnTime / completedCAPs * 100) : 0;
        
        // Overdue Rate
        const overdueCAPs = filteredCAPs.filter(cap => 
            cap.status !== 'completed' && 
            cap.dueDate && 
            cap.dueDate < now
        ).length;
        const overdueRate = filteredCAPs.length > 0 ? (overdueCAPs / filteredCAPs.length * 100) : 0;
        
        // Quality Index (based on various factors)
        const qualityScore = calculateQualityIndex(filteredCAPs);
        
        // Update KPI displays
        updateKPICard('completion', completionRate, completionRate);
        updateKPICard('efficiency', efficiencyScore, efficiencyScore);
        updateKPICard('overdue', overdueRate, 100 - overdueRate); // Invert for progress bar
        updateKPICard('quality', qualityScore, qualityScore);
        
        console.log('✅ KPIs calculated and updated');
        
    } catch (error) {
        console.error('❌ Error calculating KPIs:', error);
    }
}

// Calculate Quality Index
function calculateQualityIndex(caps) {
    if (caps.length === 0) return 0;
    
    let qualityScore = 0;
    let scoredCAPs = 0;
    
    caps.forEach(cap => {
        let capScore = 70; // Base score
        
        // Bonus for timely completion
        if (cap.status === 'completed' && cap.completedAt && cap.dueDate) {
            if (cap.completedAt <= cap.dueDate) {
                capScore += 20;
            }
        }
        
        // Bonus for good documentation
        if (cap.description && cap.description.length > 100) {
            capScore += 5;
        }
        
        // Bonus for action items
        if (cap.actionItems && cap.actionItems.length > 0) {
            capScore += 5;
        }
        
        // Penalty for overdue
        if (cap.status !== 'completed' && cap.dueDate && cap.dueDate < new Date()) {
            capScore -= 15;
        }
        
        qualityScore += Math.max(0, Math.min(100, capScore));
        scoredCAPs++;
    });
    
    return scoredCAPs > 0 ? Math.round(qualityScore / scoredCAPs) : 0;
}

// Update KPI Card
function updateKPICard(type, value, progressValue) {
    try {
        const valueEl = document.getElementById(`${type}Rate`) || document.getElementById(`${type}Score`) || document.getElementById(`${type}Index`);
        const progressEl = document.getElementById(`${type}Progress`);
        
        if (valueEl) {
            valueEl.textContent = Math.round(value) + (type === 'quality' ? '/100' : '%');
        }
        
        if (progressEl) {
            progressEl.style.width = Math.round(progressValue) + '%';
        }
        
    } catch (error) {
        console.error(`❌ Error updating ${type} KPI card:`, error);
    }
}

// Initialize Timeline Chart
async function initializeTimelineChart() {
    try {
        console.log('📈 Initializing timeline chart...');
        
        const ctx = document.getElementById('timelineChart');
        if (!ctx) return;
        
        const chartData = generateTimelineData(currentTimelineMetric);
        
        timelineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: getTimelineLabel(currentTimelineMetric),
                    data: chartData.values,
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
        
        console.log('✅ Timeline chart initialized');
        
    } catch (error) {
        console.error('❌ Error initializing timeline chart:', error);
    }
}

// Generate Timeline Data
function generateTimelineData(metricType) {
    const filteredCAPs = getFilteredCAPs();
    const days = analyticsFilters.timePeriod;
    const labels = [];
    const values = [];
    
    // Generate date range
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        let dayValue = 0;
        
        switch (metricType) {
            case 'completion':
                dayValue = filteredCAPs.filter(cap => 
                    cap.completedAt && 
                    cap.completedAt.toDateString() === date.toDateString()
                ).length;
                break;
            case 'creation':
                dayValue = filteredCAPs.filter(cap => 
                    cap.createdAt && 
                    cap.createdAt.toDateString() === date.toDateString()
                ).length;
                break;
            case 'overdue':
                dayValue = filteredCAPs.filter(cap => 
                    cap.dueDate && 
                    cap.dueDate.toDateString() === date.toDateString() &&
                    cap.status !== 'completed'
                ).length;
                break;
            case 'efficiency':
                const completedOnDay = filteredCAPs.filter(cap => 
                    cap.completedAt && 
                    cap.completedAt.toDateString() === date.toDateString()
                );
                const onTimeCompletions = completedOnDay.filter(cap => 
                    cap.dueDate && cap.completedAt <= cap.dueDate
                ).length;
                dayValue = completedOnDay.length > 0 ? (onTimeCompletions / completedOnDay.length * 100) : 0;
                break;
            default:
                dayValue = 0;
        }
        
        values.push(dayValue);
    }
    
    return { labels, values };
}

// Get Timeline Label
function getTimelineLabel(metricType) {
    const labels = {
        completion: 'CAPs Completed',
        creation: 'CAPs Created',
        overdue: 'CAPs Overdue',
        efficiency: 'Efficiency Rate (%)'
    };
    return labels[metricType] || 'CAP Activity';
}

// Generate Risk Matrix
async function generateRiskMatrix() {
    try {
        console.log('🎯 Generating risk matrix...');
        
        const filteredCAPs = getFilteredCAPs();
        const riskData = analyzeRiskDistribution(filteredCAPs);
        
        const matrixContainer = document.getElementById('riskMatrix');
        if (matrixContainer) {
            matrixContainer.innerHTML = '';
            
            // Create 5x5 risk matrix
            for (let impact = 5; impact >= 1; impact--) {
                for (let probability = 1; probability <= 5; probability++) {
                    const riskLevel = calculateRiskLevel(impact, probability);
                    const capCount = riskData[`${impact}-${probability}`] || 0;
                    
                    const cell = document.createElement('div');
                    cell.className = `risk-cell ${riskLevel}`;
                    cell.textContent = capCount;
                    cell.title = `Impact: ${impact}, Probability: ${probability}, CAPs: ${capCount}`;
                    cell.onclick = () => filterByRisk(impact, probability);
                    
                    matrixContainer.appendChild(cell);
                }
            }
        }
        
        console.log('✅ Risk matrix generated');
        
    } catch (error) {
        console.error('❌ Error generating risk matrix:', error);
    }
}

// Analyze Risk Distribution
function analyzeRiskDistribution(caps) {
    const riskData = {};
    
    caps.forEach(cap => {
        // Use explicit riskImpact/riskProbability if present; otherwise fallback from priority
        let impact = (typeof cap.riskImpact === 'number') ? cap.riskImpact : null;
        let probability = (typeof cap.riskProbability === 'number') ? cap.riskProbability : null;
        
        if (impact === null || probability === null) {
            switch (cap.priority) {
                case 'critical':
                    impact = 5; probability = 5; break;
                case 'high':
                    impact = 4; probability = 4; break;
                case 'medium':
                    impact = 3; probability = 3; break;
                case 'low':
                    impact = 2; probability = 2; break;
                default:
                    impact = 3; probability = 3;
            }
        }
        
        const key = `${impact}-${probability}`;
        riskData[key] = (riskData[key] || 0) + 1;
    });
    
    return riskData;
}

// Calculate Risk Level
function calculateRiskLevel(impact, probability) {
    const riskScore = impact * probability;
    
    if (riskScore >= 20) return 'critical';
    if (riskScore >= 15) return 'high';
    if (riskScore >= 10) return 'medium';
    return 'low';
}

// Analyze Factory Performance
async function analyzeFactoryPerformance() {
    try {
        console.log('🏭 Analyzing factory performance...');
        
        const factoryStats = calculateFactoryStats();
        
        const listContainer = document.getElementById('factoryPerformanceList');
        if (listContainer) {
            listContainer.innerHTML = factoryStats.map(factory => `
                <div class="performance-item">
                    <div class="factory-info">
                        <div class="factory-name">${factory.name}</div>
                        <div class="factory-stats">
                            <span>${factory.totalCAPs} CAPs</span>
                            <span>${factory.completedCAPs} Completed</span>
                            <span>${factory.overdueCAPs} Overdue</span>
                            <span>${factory.completionRate}% Rate</span>
                        </div>
                    </div>
                    <div class="performance-score">
                        <div class="score-value">${factory.performanceScore}</div>
                        <div class="score-label">Score</div>
                    </div>
                </div>
            `).join('');
        }
        
        console.log('✅ Factory performance analysis completed');
        
    } catch (error) {
        console.error('❌ Error analyzing factory performance:', error);
    }
}

// Calculate Factory Stats
function calculateFactoryStats() {
    const filteredCAPs = getFilteredCAPs();
    const factoryStats = [];
    
    factories.forEach(factory => {
        const factoryCAPs = filteredCAPs.filter(cap => cap.factoryId === factory.id);
        const completedCAPs = factoryCAPs.filter(cap => cap.status === 'completed').length;
        const overdueCAPs = factoryCAPs.filter(cap => 
            cap.status !== 'completed' && 
            cap.dueDate && 
            cap.dueDate < new Date()
        ).length;
        
        const completionRate = factoryCAPs.length > 0 ? Math.round(completedCAPs / factoryCAPs.length * 100) : 0;
        
        // Calculate performance score
        let performanceScore = completionRate;
        if (overdueCAPs === 0 && factoryCAPs.length > 0) performanceScore += 10;
        if (completionRate >= 90) performanceScore += 5;
        performanceScore = Math.min(100, performanceScore);
        
        factoryStats.push({
            id: factory.id,
            name: factory.name,
            totalCAPs: factoryCAPs.length,
            completedCAPs,
            overdueCAPs,
            completionRate,
            performanceScore
        });
    });
    
    // Sort by performance score (descending)
    return factoryStats.sort((a, b) => b.performanceScore - a.performanceScore);
}

// Utility Functions
function getFilteredCAPs() {
    let filtered = [...caps];
    
    // Filter by time period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - analyticsFilters.timePeriod);
    const dateField = analyticsFilters.dateMode || 'createdAt';
    filtered = filtered.filter(cap => {
        const dt = cap[dateField];
        return dt instanceof Date && dt >= cutoffDate;
    });
    
    // Filter by factory
    if (analyticsFilters.factory !== 'all') {
        filtered = filtered.filter(cap => cap.factoryId === analyticsFilters.factory);
    }
    
    // Filter by priority
    if (analyticsFilters.priority !== 'all') {
        filtered = filtered.filter(cap => cap.priority === analyticsFilters.priority);
    }
    
    // Filter by status
    if (analyticsFilters.status !== 'all') {
        filtered = filtered.filter(cap => cap.status === analyticsFilters.status);
    }
    
    // Filter by category
    if (analyticsFilters.category !== 'all') {
        filtered = filtered.filter(cap => cap.category === analyticsFilters.category);
    }
    
    // Filter by risk (explicit fields if available)
    if (analyticsFilters.riskImpact && analyticsFilters.riskProbability) {
        filtered = filtered.filter(cap => 
            cap.riskImpact === analyticsFilters.riskImpact &&
            cap.riskProbability === analyticsFilters.riskProbability
        );
    }
    
    return filtered;
}

function safeToDate(dateValue) {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue;
    if (dateValue && typeof dateValue.toDate === 'function') return dateValue.toDate();
    if (typeof dateValue === 'string') {
        const parsed = new Date(dateValue);
        return isNaN(parsed.getTime()) ? null : parsed;
    }
    if (typeof dateValue === 'number') return new Date(dateValue);
    if (dateValue && typeof dateValue.seconds === 'number') {
        return new Date(dateValue.seconds * 1000);
    }
    return null;
}

function showError(message) {
    console.error('❌ CAP Analytics Error:', message);
    // Could implement a toast notification here
}

// Chart Functions
function changeTimelineMetric(metricType) {
    currentTimelineMetric = metricType;
    
    if (!timelineChart) return;
    
    const chartData = generateTimelineData(metricType);
    
    timelineChart.data.labels = chartData.labels;
    timelineChart.data.datasets[0].label = getTimelineLabel(metricType);
    timelineChart.data.datasets[0].data = chartData.values;
    
    timelineChart.update();
    
    console.log(`📊 Timeline chart updated to show ${metricType} data`);
}

// Analytics Interface Functions
function updateAnalytics() {
    // Update filters
    analyticsFilters.timePeriod = parseInt(document.getElementById('timePeriod').value);
    analyticsFilters.factory = document.getElementById('factoryFilter').value;
    analyticsFilters.priority = document.getElementById('priorityFilter').value;
    analyticsFilters.status = (document.getElementById('statusFilter')||{}).value || 'all';
    analyticsFilters.dateMode = (document.getElementById('dateMode')||{}).value || 'createdAt';
    analyticsFilters.category = (document.getElementById('categoryFilter')||{}).value || 'all';
    
    console.log('🔄 Updating analytics with new filters:', analyticsFilters);
    
    // Recalculate all analytics
    Promise.all([
        calculateKPIs(),
        changeTimelineMetric(currentTimelineMetric),
        generateRiskMatrix(),
        analyzeFactoryPerformance()
    ]).then(() => {
        console.log('✅ Analytics updated successfully');
    }).catch(error => {
        console.error('❌ Error updating analytics:', error);
    });
}

function refreshAnalytics() {
    console.log('🔄 Refreshing CAP analytics...');
    // Stop existing listeners to prevent duplicates
    stopRealTimeListeners();
    initializeAnalytics();
}

function refreshRiskMatrix() {
    console.log('🎯 Refreshing risk matrix...');
    generateRiskMatrix();
}

function filterByRisk(impact, probability) {
    console.log(`🎯 Filtering CAPs by risk: Impact ${impact}, Probability ${probability}`);
    analyticsFilters.riskImpact = impact;
    analyticsFilters.riskProbability = probability;
    updateAnalytics();
}

function clearRiskFilter() {
    analyticsFilters.riskImpact = null;
    analyticsFilters.riskProbability = null;
    updateAnalytics();
}

function sortFactories(criteria) {
    console.log(`🏭 Sorting factories by: ${criteria}`);
    
    const factoryStats = calculateFactoryStats();
    
    if (criteria === 'completion') {
        factoryStats.sort((a, b) => b.completionRate - a.completionRate);
    } else if (criteria === 'performance') {
        factoryStats.sort((a, b) => b.performanceScore - a.performanceScore);
    }
    
    // Update display
    const listContainer = document.getElementById('factoryPerformanceList');
    if (listContainer) {
        listContainer.innerHTML = factoryStats.map(factory => `
            <div class="performance-item">
                <div class="factory-info">
                    <div class="factory-name">${factory.name}</div>
                    <div class="factory-stats">
                        <span>${factory.totalCAPs} CAPs</span>
                        <span>${factory.completedCAPs} Completed</span>
                        <span>${factory.overdueCAPs} Overdue</span>
                        <span>${factory.completionRate}% Rate</span>
                    </div>
                </div>
                <div class="performance-score">
                    <div class="score-value">${factory.performanceScore}</div>
                    <div class="score-label">Score</div>
                </div>
            </div>
        `).join('');
    }
}

function exportAnalytics() {
    console.log('📄 Exporting CAP analytics report...');
    
    const filteredCAPs = getFilteredCAPs();
    const factoryStats = calculateFactoryStats();
    
    const reportData = {
        timestamp: new Date().toISOString(),
        filters: analyticsFilters,
        summary: {
            totalCAPs: filteredCAPs.length,
            completedCAPs: filteredCAPs.filter(cap => cap.status === 'completed').length,
            overdueCAPs: filteredCAPs.filter(cap => 
                cap.status !== 'completed' && 
                cap.dueDate && 
                cap.dueDate < new Date()
            ).length
        },
        factoryPerformance: factoryStats,
        reportType: 'cap_analytics'
    };
    
    // Create and download report
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `cap_analytics_${new Date().toISOString().split('T')[0]}.json`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log('✅ CAP analytics report exported');
}

// Simple PDF export using browser print to PDF
function exportAnalyticsPDF() {
    console.log('🖨️ Exporting analytics as PDF...');
    // Open print dialog; users can save as PDF
    window.print();
}

function exportFactoryReport() {
    console.log('🏭 Exporting factory performance report...');
    
    const factoryStats = calculateFactoryStats();
    
    // Create CSV content
    const csvContent = [
        'Factory Name,Total CAPs,Completed CAPs,Overdue CAPs,Completion Rate,Performance Score',
        ...factoryStats.map(factory => 
            `"${factory.name}",${factory.totalCAPs},${factory.completedCAPs},${factory.overdueCAPs},${factory.completionRate}%,${factory.performanceScore}`
        )
    ].join('\n');
    
    // Create and download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `factory_cap_performance_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log('✅ Factory performance report exported');
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
        if (timelineChart) {
            timelineChart.destroy();
        }
        // Clean up listeners
        stopRealTimeListeners();
        
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

// Real-time listeners
function startRealTimeListeners() {
    console.log('🔌 Starting real-time CAP analytics listeners...');
    
    // CAPs listener
    try {
        let capsQuery = collection(db, 'caps');
        // If factory_admin, scope to their factory if available in profile
        if (window.currentUser && window.currentUser.role === 'factory_admin' && window.currentUser.factoryId) {
            capsQuery = capsQuery.where('factoryId', '==', window.currentUser.factoryId);
        }
        unsubscribeCaps = capsQuery.onSnapshot((snapshot) => {
            caps = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: safeToDate(doc.data().createdAt),
                dueDate: safeToDate(doc.data().dueDate),
                updatedAt: safeToDate(doc.data().updatedAt),
                completedAt: safeToDate(doc.data().completedAt),
                riskImpact: typeof doc.data().riskImpact === 'number' ? doc.data().riskImpact : null,
                riskProbability: typeof doc.data().riskProbability === 'number' ? doc.data().riskProbability : null,
                category: doc.data().category || null,
                status: doc.data().status || null,
                priority: doc.data().priority || null
            }));
            updateAllAnalytics('caps');
        }, (error) => {
            console.error('❌ Real-time CAPs listener error:', error);
        });
    } catch (e) {
        console.error('❌ Failed to start CAPs listener:', e);
    }
    
    // Factories listener (less frequent changes, but keep in sync)
    try {
        let factoriesQuery = collection(db, 'factories');
        // For factory_admin, you might restrict to their factory for performance
        if (window.currentUser && window.currentUser.role === 'factory_admin' && window.currentUser.factoryId) {
            factoriesQuery = factoriesQuery.where('__name__', '==', window.currentUser.factoryId);
        }
        unsubscribeFactories = factoriesQuery.onSnapshot((snapshot) => {
            factories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            updateAllAnalytics('factories');
        }, (error) => {
            console.error('❌ Real-time factories listener error:', error);
        });
    } catch (e) {
        console.error('❌ Failed to start factories listener:', e);
    }
}

function stopRealTimeListeners() {
    if (typeof unsubscribeCaps === 'function') {
        try { unsubscribeCaps(); } catch (_) {}
        unsubscribeCaps = null;
    }
    if (typeof unsubscribeFactories === 'function') {
        try { unsubscribeFactories(); } catch (_) {}
        unsubscribeFactories = null;
    }
}

function updateAllAnalytics(source) {
    // Recalculate KPIs, chart, risk matrix, and factory performance
    Promise.all([
        calculateKPIs(),
        (async () => { if (timelineChart) changeTimelineMetric(currentTimelineMetric); })(),
        generateRiskMatrix(),
        analyzeFactoryPerformance()
    ]).then(() => {
        if (source) console.log(`✅ Analytics updated (source: ${source})`);
    }).catch(error => {
        console.error('❌ Error updating analytics in real-time:', error);
    });
}

// CSV Export for CAPs
function exportCAPsCSV() {
    console.log('📄 Exporting CAPs CSV...');
    const filteredCAPs = getFilteredCAPs();
    const factoryMap = factories.reduce((map, f) => { map[f.id] = f.name || f.id; return map; }, {});
    
    const header = [
        'CAP ID','Title','Status','Priority','Factory','Created At','Due Date','Completed At','Progress'
    ];
    const rows = filteredCAPs.map(cap => [
        cap.id,
        (cap.title || '').toString().replace(/"/g, '""'),
        cap.status || '',
        cap.priority || '',
        factoryMap[cap.factoryId] || cap.factoryId || '',
        cap.createdAt ? cap.createdAt.toISOString() : '',
        cap.dueDate ? cap.dueDate.toISOString() : '',
        cap.completedAt ? cap.completedAt.toISOString() : '',
        typeof cap.progress === 'number' ? cap.progress : ''
    ]);
    
    const csv = [header.join(','), ...rows.map(r => r.map(v => /[",\n]/.test(String(v)) ? `"${v}"` : String(v)).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `caps_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('✅ CAPs CSV exported');
}

// Global functions for HTML onclick handlers
window.updateAnalytics = updateAnalytics;
window.refreshAnalytics = refreshAnalytics;
window.refreshRiskMatrix = refreshRiskMatrix;
window.changeTimelineMetric = changeTimelineMetric;
window.sortFactories = sortFactories;
window.exportAnalytics = exportAnalytics;
window.exportFactoryReport = exportFactoryReport;
window.exportCAPsCSV = exportCAPsCSV;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.logout = logout;

// Start the initialization process
initializeCapanalytics();
