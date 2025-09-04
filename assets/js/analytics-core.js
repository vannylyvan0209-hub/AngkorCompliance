// Core Analytics System
class AnalyticsCore {
    constructor() {
        this.charts = new Map();
        this.dataCache = new Map();
        this.realTimeData = new Map();
        this.init();
    }

    async init() {
        console.log('📊 Initializing Analytics Core...');
        this.setupRealTimeListeners();
        this.setupDataRefresh();
        console.log('✅ Analytics Core initialized');
    }

    setupRealTimeListeners() {
        // Document analytics
        collection(db, 'documents', onSnapshot(snapshot => {
            const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.realTimeData.set('documents', documents);
            this.updateDocumentAnalytics();
        });

        // CAP analytics
        collection(db, 'caps', onSnapshot(snapshot => {
            const caps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.realTimeData.set('caps', caps);
            this.updateCAPAnalytics();
        });

        // User analytics
        collection(db, 'users', onSnapshot(snapshot => {
            const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.realTimeData.set('users', users);
            this.updateUserAnalytics();
        });
    }

    setupDataRefresh() {
        setInterval(() => {
            this.refreshAllAnalytics();
        }, 30000); // 30 seconds
    }

    async refreshAllAnalytics() {
        await Promise.all([
            this.updateDocumentAnalytics(),
            this.updateCAPAnalytics(),
            this.updateUserAnalytics()
        ]);
    }

    async updateDocumentAnalytics() {
        const documents = this.realTimeData.get('documents') || [];
        const analytics = {
            total: documents.length,
            byCategory: this.groupBy(documents, 'category'),
            byStatus: this.groupBy(documents, 'status'),
            expiringSoon: documents.filter(doc => {
                if (!doc.expirationDate) return false;
                const daysUntilExpiration = Math.ceil((doc.expirationDate.toDate() - new Date()) / (1000 * 60 * 60 * 24));
                return daysUntilExpiration <= 30 && daysUntilExpiration > 0;
            }).length
        };
        this.dataCache.set('documentAnalytics', analytics);
        this.updateCharts('document', analytics);
    }

    async updateCAPAnalytics() {
        const caps = this.realTimeData.get('caps') || [];
        const analytics = {
            total: caps.length,
            byStatus: this.groupBy(caps, 'status'),
            byPriority: this.groupBy(caps, 'priority'),
            overdue: caps.filter(cap => {
                if (!cap.dueDate) return false;
                return cap.dueDate.toDate() < new Date() && cap.status !== 'completed';
            }).length,
            completionRate: this.calculateCompletionRate(caps)
        };
        this.dataCache.set('capAnalytics', analytics);
        this.updateCharts('cap', analytics);
    }

    async updateUserAnalytics() {
        const users = this.realTimeData.get('users') || [];
        const analytics = {
            total: users.length,
            byRole: this.groupBy(users, 'role'),
            byStatus: this.groupBy(users, 'status'),
            active: users.filter(user => user.status === 'active').length
        };
        this.dataCache.set('userAnalytics', analytics);
        this.updateCharts('user', analytics);
    }

    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key] || 'Unknown';
            result[group] = result[group] || [];
            result[group].push(item);
            return result;
        }, {});
    }

    calculateCompletionRate(caps) {
        if (caps.length === 0) return 0;
        const completed = caps.filter(cap => cap.status === 'completed').length;
        return Math.round((completed / caps.length) * 100);
    }

    updateCharts(type, data) {
        // Update pie charts
        this.updatePieChart(`${type}StatusChart`, data.byStatus, `${type.toUpperCase()} Status`);
        this.updatePieChart(`${type}CategoryChart`, data.byCategory, `${type.toUpperCase()} Categories`);
    }

    updatePieChart(chartId, data, label) {
        const canvas = document.getElementById(chartId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (this.charts.has(chartId)) {
            this.charts.get(chartId).destroy();
        }

        const chartData = {
            type: 'pie',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    data: Object.values(data).map(item => Array.isArray(item) ? item.length : item),
                    backgroundColor: this.generateColors(Object.keys(data).length)
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: label }
                }
            }
        };

        const chart = new Chart(ctx, chartData);
        this.charts.set(chartId, chart);
    }

    generateColors(count) {
        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(colors[i % colors.length]);
        }
        return result;
    }

    async generateReport(reportType) {
        const report = {
            type: reportType,
            generatedAt: new Date(),
            data: this.dataCache.get(`${reportType}Analytics`) || {},
            summary: this.generateSummary(reportType)
        };

        await collection(db, 'analytics_reports', {
            ...report,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: auth.currentUser?.uid
        });

        return report;
    }

    generateSummary(type) {
        const data = this.dataCache.get(`${type}Analytics`) || {};
        return {
            total: data.total || 0,
            keyMetrics: Object.keys(data).filter(key => key !== 'total')
        };
    }

    destroy() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
        this.dataCache.clear();
        this.realTimeData.clear();
    }
}

// Initialize analytics
let analyticsCore;

// Wait for Firebase to be available before initializing
function initializeAnalyticscore() {
    // Check if Firebase is available
    if (!window.Firebase) {
        console.log('⏳ Waiting for Firebase to initialize...');
        setTimeout(initializeAnalyticscore, 100);
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
    analyticsCore = new AnalyticsCore();
});

// Global functions
window.generateAnalyticsReport = (type) => {
    if (analyticsCore) {
        return analyticsCore.generateReport(type);
    }
};

// Start the initialization process
initializeAnalyticscore();
