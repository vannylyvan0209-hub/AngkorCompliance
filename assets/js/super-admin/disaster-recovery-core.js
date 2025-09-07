// Disaster Recovery Planning Core
class DisasterRecoveryCore {
    constructor() {
        this.currentUser = null;
        this.recoveryPlans = [];
        this.businessContinuity = [];
        this.emergencyResponse = [];
        this.testingValidation = [];
        this.currentTab = 'plans';
        this.isLoading = false;
        
        this.init();
    }
    
    async init() {
        console.log('🚨 Initializing Disaster Recovery Planning Core...');
        await this.initializeFirebase();
        await this.checkAuthentication();
        this.initializeNavigation();
        await this.loadInitialData();
        this.initializeUI();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        console.log('✅ Disaster Recovery Planning Core initialized');
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
                this.deleteDoc = window.Firebase.deleteDoc;
                this.query = window.Firebase.query;
                this.where = window.Firebase.where;
                this.orderBy = window.Firebase.orderBy;
                this.onSnapshot = window.Firebase.onSnapshot;
                this.getDocs = window.Firebase.getDocs;
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
                            if (userData.role === 'super_admin') {
                                this.currentUser = { ...user, ...userData };
                                resolve();
                            } else {
                                console.log('❌ Access denied - super admin privileges required');
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
    
    initializeNavigation() {
        if (window.superAdminNavigation) {
            window.superAdminNavigation.updateCurrentPage('Disaster Recovery Planning');
        } else {
            setTimeout(() => { this.initializeNavigation(); }, 100);
        }
    }
    
    async loadInitialData() {
        await Promise.all([
            this.loadRecoveryPlans(),
            this.loadBusinessContinuity(),
            this.loadEmergencyResponse(),
            this.loadTestingValidation()
        ]);
        
        this.updateOverviewStats();
        this.renderRecoveryPlans();
        this.renderBusinessContinuity();
        this.renderEmergencyResponse();
        this.renderTestingValidation();
    }
    
    async loadRecoveryPlans() {
        try {
            const plansRef = this.collection(this.db, 'recovery_plans');
            const snapshot = await this.getDocs(plansRef);
            this.recoveryPlans = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.recoveryPlans.length === 0) {
                this.recoveryPlans = this.getMockRecoveryPlans();
            }
            console.log(`✓ Loaded ${this.recoveryPlans.length} recovery plans`);
        } catch (error) {
            console.error('Error loading recovery plans:', error);
            this.recoveryPlans = this.getMockRecoveryPlans();
        }
    }
    
    async loadBusinessContinuity() {
        try {
            const continuityRef = this.collection(this.db, 'business_continuity');
            const snapshot = await this.getDocs(continuityRef);
            this.businessContinuity = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.businessContinuity.length === 0) {
                this.businessContinuity = this.getMockBusinessContinuity();
            }
            console.log(`✓ Loaded ${this.businessContinuity.length} business continuity items`);
        } catch (error) {
            console.error('Error loading business continuity:', error);
            this.businessContinuity = this.getMockBusinessContinuity();
        }
    }
    
    async loadEmergencyResponse() {
        try {
            const responseRef = this.collection(this.db, 'emergency_response');
            const snapshot = await this.getDocs(responseRef);
            this.emergencyResponse = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.emergencyResponse.length === 0) {
                this.emergencyResponse = this.getMockEmergencyResponse();
            }
            console.log(`✓ Loaded ${this.emergencyResponse.length} emergency response items`);
        } catch (error) {
            console.error('Error loading emergency response:', error);
            this.emergencyResponse = this.getMockEmergencyResponse();
        }
    }
    
    async loadTestingValidation() {
        try {
            const testingRef = this.collection(this.db, 'testing_validation');
            const snapshot = await this.getDocs(testingRef);
            this.testingValidation = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            if (this.testingValidation.length === 0) {
                this.testingValidation = this.getMockTestingValidation();
            }
            console.log(`✓ Loaded ${this.testingValidation.length} testing validation items`);
        } catch (error) {
            console.error('Error loading testing validation:', error);
            this.testingValidation = this.getMockTestingValidation();
        }
    }
    
    getMockRecoveryPlans() {
        return [
            {
                id: 'plan_1',
                name: 'Database Recovery Plan',
                description: 'Comprehensive plan for database disaster recovery and data restoration',
                status: 'active',
                lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                rto: '4 hours',
                rpo: '1 hour',
                priority: 'critical',
                metrics: {
                    lastTested: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
                    testSuccess: 95,
                    recoveryTime: '3.5 hours',
                    dataLoss: '45 minutes'
                }
            },
            {
                id: 'plan_2',
                name: 'Application Server Recovery',
                description: 'Recovery procedures for application server failures and service restoration',
                status: 'active',
                lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                rto: '2 hours',
                rpo: '30 minutes',
                priority: 'high',
                metrics: {
                    lastTested: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
                    testSuccess: 88,
                    recoveryTime: '1.8 hours',
                    dataLoss: '25 minutes'
                }
            },
            {
                id: 'plan_3',
                name: 'Network Infrastructure Recovery',
                description: 'Network infrastructure disaster recovery and connectivity restoration',
                status: 'active',
                lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                rto: '6 hours',
                rpo: '2 hours',
                priority: 'high',
                metrics: {
                    lastTested: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
                    testSuccess: 92,
                    recoveryTime: '5.2 hours',
                    dataLoss: '1.5 hours'
                }
            },
            {
                id: 'plan_4',
                name: 'Cloud Services Recovery',
                description: 'Cloud service provider disaster recovery and failover procedures',
                status: 'active',
                lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                rto: '1 hour',
                rpo: '15 minutes',
                priority: 'critical',
                metrics: {
                    lastTested: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
                    testSuccess: 98,
                    recoveryTime: '45 minutes',
                    dataLoss: '10 minutes'
                }
            },
            {
                id: 'plan_5',
                name: 'Security Incident Recovery',
                description: 'Security incident response and system recovery procedures',
                status: 'draft',
                lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
                rto: '8 hours',
                rpo: '4 hours',
                priority: 'critical',
                metrics: {
                    lastTested: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
                    testSuccess: 75,
                    recoveryTime: '7.2 hours',
                    dataLoss: '3.5 hours'
                }
            },
            {
                id: 'plan_6',
                name: 'Data Center Recovery',
                description: 'Complete data center disaster recovery and site restoration',
                status: 'active',
                lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
                rto: '24 hours',
                rpo: '8 hours',
                priority: 'medium',
                metrics: {
                    lastTested: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
                    testSuccess: 85,
                    recoveryTime: '22 hours',
                    dataLoss: '6.5 hours'
                }
            }
        ];
    }
    
    getMockBusinessContinuity() {
        return [
            {
                id: 'continuity_1',
                name: 'Critical Business Functions',
                description: 'Essential business functions that must continue during disaster scenarios',
                status: 'operational',
                lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                priority: 'critical',
                dependencies: ['Database', 'Application Server', 'Network'],
                metrics: {
                    uptime: 99.9,
                    lastIncident: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
                    recoveryTime: '2 hours',
                    impact: 'High'
                }
            },
            {
                id: 'continuity_2',
                name: 'Customer Support Services',
                description: 'Customer support and communication services continuity planning',
                status: 'operational',
                lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                priority: 'high',
                dependencies: ['Communication Systems', 'Support Tools'],
                metrics: {
                    uptime: 99.5,
                    lastIncident: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
                    recoveryTime: '1 hour',
                    impact: 'Medium'
                }
            },
            {
                id: 'continuity_3',
                name: 'Financial Operations',
                description: 'Financial systems and payment processing continuity',
                status: 'operational',
                lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                priority: 'critical',
                dependencies: ['Payment Gateway', 'Billing System', 'Database'],
                metrics: {
                    uptime: 99.95,
                    lastIncident: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
                    recoveryTime: '30 minutes',
                    impact: 'Critical'
                }
            },
            {
                id: 'continuity_4',
                name: 'Compliance Reporting',
                description: 'Regulatory compliance and reporting continuity',
                status: 'degraded',
                lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                priority: 'high',
                dependencies: ['Reporting System', 'Data Warehouse', 'Audit Tools'],
                metrics: {
                    uptime: 98.5,
                    lastIncident: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
                    recoveryTime: '4 hours',
                    impact: 'High'
                }
            },
            {
                id: 'continuity_5',
                name: 'Factory Operations',
                description: 'Factory management and compliance operations continuity',
                status: 'operational',
                lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                priority: 'critical',
                dependencies: ['Factory Systems', 'Compliance Tools', 'Monitoring'],
                metrics: {
                    uptime: 99.8,
                    lastIncident: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
                    recoveryTime: '1.5 hours',
                    impact: 'Critical'
                }
            },
            {
                id: 'continuity_6',
                name: 'Analytics and Reporting',
                description: 'Business intelligence and analytics continuity',
                status: 'operational',
                lastUpdated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
                priority: 'medium',
                dependencies: ['Analytics Platform', 'Data Pipeline', 'Visualization Tools'],
                metrics: {
                    uptime: 99.2,
                    lastIncident: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
                    recoveryTime: '3 hours',
                    impact: 'Medium'
                }
            }
        ];
    }
    
    getMockEmergencyResponse() {
        return [
            {
                id: 'response_1',
                name: 'System Outage Response',
                description: 'Emergency response procedures for system outages and service disruptions',
                priority: 'high',
                lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                escalation: {
                    level1: '5 minutes',
                    level2: '15 minutes',
                    level3: '30 minutes'
                },
                contacts: {
                    primary: 'admin@angkor-compliance.com',
                    secondary: '+855 23 123 456',
                    emergency: '+855 23 999 999'
                },
                procedures: [
                    'Assess system impact',
                    'Notify stakeholders',
                    'Activate backup systems',
                    'Monitor recovery progress'
                ]
            },
            {
                id: 'response_2',
                name: 'Security Breach Response',
                description: 'Emergency response for security incidents and data breaches',
                priority: 'high',
                lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                escalation: {
                    level1: 'Immediate',
                    level2: '5 minutes',
                    level3: '10 minutes'
                },
                contacts: {
                    primary: 'security@angkor-compliance.com',
                    secondary: '+855 23 123 457',
                    emergency: '+855 23 888 888'
                },
                procedures: [
                    'Contain the breach',
                    'Assess data exposure',
                    'Notify authorities',
                    'Implement remediation'
                ]
            },
            {
                id: 'response_3',
                name: 'Data Loss Response',
                description: 'Emergency response for data loss incidents and corruption',
                priority: 'critical',
                lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                escalation: {
                    level1: 'Immediate',
                    level2: '5 minutes',
                    level3: '15 minutes'
                },
                contacts: {
                    primary: 'data@angkor-compliance.com',
                    secondary: '+855 23 123 458',
                    emergency: '+855 23 777 777'
                },
                procedures: [
                    'Stop data operations',
                    'Assess data integrity',
                    'Restore from backups',
                    'Validate data recovery'
                ]
            },
            {
                id: 'response_4',
                name: 'Natural Disaster Response',
                description: 'Emergency response for natural disasters and environmental emergencies',
                priority: 'medium',
                lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
                escalation: {
                    level1: '30 minutes',
                    level2: '1 hour',
                    level3: '2 hours'
                },
                contacts: {
                    primary: 'emergency@angkor-compliance.com',
                    secondary: '+855 23 123 459',
                    emergency: '+855 23 666 666'
                },
                procedures: [
                    'Assess facility safety',
                    'Evacuate if necessary',
                    'Activate remote operations',
                    'Coordinate with authorities'
                ]
            },
            {
                id: 'response_5',
                name: 'Network Attack Response',
                description: 'Emergency response for network attacks and DDoS incidents',
                priority: 'high',
                lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                escalation: {
                    level1: '5 minutes',
                    level2: '10 minutes',
                    level3: '20 minutes'
                },
                contacts: {
                    primary: 'network@angkor-compliance.com',
                    secondary: '+855 23 123 460',
                    emergency: '+855 23 555 555'
                },
                procedures: [
                    'Identify attack source',
                    'Implement traffic filtering',
                    'Activate DDoS protection',
                    'Monitor network health'
                ]
            },
            {
                id: 'response_6',
                name: 'Compliance Violation Response',
                description: 'Emergency response for compliance violations and regulatory issues',
                priority: 'medium',
                lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
                escalation: {
                    level1: '1 hour',
                    level2: '2 hours',
                    level3: '4 hours'
                },
                contacts: {
                    primary: 'compliance@angkor-compliance.com',
                    secondary: '+855 23 123 461',
                    emergency: '+855 23 444 444'
                },
                procedures: [
                    'Document violation',
                    'Notify legal team',
                    'Implement corrective measures',
                    'Report to authorities'
                ]
            }
        ];
    }
    
    getMockTestingValidation() {
        return [
            {
                id: 'test_1',
                name: 'Database Recovery Test',
                description: 'Comprehensive testing of database disaster recovery procedures',
                status: 'passed',
                lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
                nextScheduled: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
                results: {
                    recoveryTime: '3.2 hours',
                    dataIntegrity: 99.8,
                    testDuration: '4 hours',
                    issuesFound: 2
                },
                coverage: {
                    scenarios: 8,
                    procedures: 15,
                    systems: 5
                }
            },
            {
                id: 'test_2',
                name: 'Application Failover Test',
                description: 'Testing of application server failover and load balancing',
                status: 'passed',
                lastRun: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
                nextScheduled: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
                results: {
                    failoverTime: '45 seconds',
                    serviceContinuity: 99.9,
                    testDuration: '2 hours',
                    issuesFound: 0
                },
                coverage: {
                    scenarios: 6,
                    procedures: 12,
                    systems: 3
                }
            },
            {
                id: 'test_3',
                name: 'Network Redundancy Test',
                description: 'Testing of network redundancy and connectivity failover',
                status: 'failed',
                lastRun: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
                nextScheduled: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
                results: {
                    failoverTime: '8 minutes',
                    connectivity: 95.2,
                    testDuration: '3 hours',
                    issuesFound: 5
                },
                coverage: {
                    scenarios: 10,
                    procedures: 18,
                    systems: 8
                }
            },
            {
                id: 'test_4',
                name: 'Backup Restoration Test',
                description: 'Testing of backup systems and data restoration procedures',
                status: 'passed',
                lastRun: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
                nextScheduled: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
                results: {
                    restorationTime: '2.5 hours',
                    dataIntegrity: 99.95,
                    testDuration: '3.5 hours',
                    issuesFound: 1
                },
                coverage: {
                    scenarios: 12,
                    procedures: 20,
                    systems: 6
                }
            },
            {
                id: 'test_5',
                name: 'Security Incident Response Test',
                description: 'Testing of security incident response and containment procedures',
                status: 'pending',
                lastRun: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
                nextScheduled: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
                results: {
                    responseTime: 'N/A',
                    containment: 'N/A',
                    testDuration: 'N/A',
                    issuesFound: 'N/A'
                },
                coverage: {
                    scenarios: 15,
                    procedures: 25,
                    systems: 10
                }
            },
            {
                id: 'test_6',
                name: 'End-to-End Recovery Test',
                description: 'Comprehensive end-to-end disaster recovery testing',
                status: 'passed',
                lastRun: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
                nextScheduled: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
                results: {
                    totalRecoveryTime: '6.5 hours',
                    systemAvailability: 98.5,
                    testDuration: '8 hours',
                    issuesFound: 3
                },
                coverage: {
                    scenarios: 25,
                    procedures: 50,
                    systems: 15
                }
            }
        ];
    }
    
    updateOverviewStats() {
        const activePlans = this.recoveryPlans.filter(plan => plan.status === 'active').length;
        const backupStatus = 98; // Mock backup completion rate
        const avgRto = this.calculateAverageRTO();
        const testSuccessRate = this.calculateTestSuccessRate();
        
        document.getElementById('recoveryPlans').textContent = activePlans;
        document.getElementById('backupStatus').textContent = `${backupStatus}%`;
        document.getElementById('rtoRpo').textContent = avgRto;
        document.getElementById('testStatus').textContent = `${testSuccessRate}%`;
    }
    
    calculateAverageRTO() {
        const activePlans = this.recoveryPlans.filter(plan => plan.status === 'active');
        if (activePlans.length === 0) return 'N/A';
        
        const totalHours = activePlans.reduce((sum, plan) => {
            const hours = parseFloat(plan.rto.replace(' hours', '').replace(' hour', ''));
            return sum + hours;
        }, 0);
        
        const avgHours = totalHours / activePlans.length;
        return `${avgHours.toFixed(1)}h`;
    }
    
    calculateTestSuccessRate() {
        const completedTests = this.testingValidation.filter(test => test.status === 'passed' || test.status === 'failed');
        if (completedTests.length === 0) return 0;
        
        const passedTests = completedTests.filter(test => test.status === 'passed').length;
        return Math.round((passedTests / completedTests.length) * 100);
    }
    
    renderRecoveryPlans() {
        const container = document.getElementById('recoveryPlansGrid');
        if (!container) return;
        
        container.innerHTML = this.recoveryPlans.map(plan => `
            <div class="plan-item">
                <div class="plan-header">
                    <div class="plan-name">${plan.name}</div>
                    <div class="plan-status ${plan.status}">${plan.status}</div>
                </div>
                <div class="plan-description">${plan.description}</div>
                <div class="plan-metrics">
                    <div><strong>RTO:</strong> ${plan.rto}</div>
                    <div><strong>RPO:</strong> ${plan.rpo}</div>
                    <div><strong>Priority:</strong> ${plan.priority}</div>
                    <div><strong>Last Test:</strong> ${this.formatTime(plan.metrics.lastTested)}</div>
                </div>
                <div class="plan-actions">
                    <button class="plan-btn" onclick="viewPlanDetails('${plan.id}')">View Details</button>
                    <button class="plan-btn" onclick="testPlan('${plan.id}')">Test Plan</button>
                    <button class="plan-btn" onclick="editPlan('${plan.id}')">Edit</button>
                </div>
            </div>
        `).join('');
    }
    
    renderBusinessContinuity() {
        const container = document.getElementById('businessContinuityGrid');
        if (!container) return;
        
        container.innerHTML = this.businessContinuity.map(continuity => `
            <div class="continuity-item">
                <div class="continuity-header">
                    <div class="continuity-name">${continuity.name}</div>
                    <div class="continuity-status ${continuity.status}">${continuity.status}</div>
                </div>
                <div class="continuity-description">${continuity.description}</div>
                <div style="margin-bottom: var(--space-3); font-size: var(--text-xs); color: var(--neutral-500);">
                    <strong>Uptime:</strong> ${continuity.metrics.uptime}%<br>
                    <strong>Priority:</strong> ${continuity.priority}<br>
                    <strong>Last Incident:</strong> ${this.formatTime(continuity.metrics.lastIncident)}
                </div>
                <div class="continuity-actions">
                    <button class="continuity-btn" onclick="viewContinuityDetails('${continuity.id}')">View Details</button>
                    <button class="continuity-btn" onclick="testContinuity('${continuity.id}')">Test</button>
                    <button class="continuity-btn" onclick="editContinuity('${continuity.id}')">Edit</button>
                </div>
            </div>
        `).join('');
    }
    
    renderEmergencyResponse() {
        const container = document.getElementById('emergencyResponseGrid');
        if (!container) return;
        
        container.innerHTML = this.emergencyResponse.map(response => `
            <div class="response-item">
                <div class="response-header">
                    <div class="response-name">${response.name}</div>
                    <div class="response-priority ${response.priority}">${response.priority}</div>
                </div>
                <div class="response-description">${response.description}</div>
                <div style="margin-bottom: var(--space-3); font-size: var(--text-xs); color: var(--neutral-500);">
                    <strong>Escalation:</strong> ${response.escalation.level1} → ${response.escalation.level2} → ${response.escalation.level3}<br>
                    <strong>Primary Contact:</strong> ${response.contacts.primary}<br>
                    <strong>Updated:</strong> ${this.formatTime(response.lastUpdated)}
                </div>
                <div class="response-actions">
                    <button class="response-btn" onclick="viewResponseDetails('${response.id}')">View Details</button>
                    <button class="response-btn" onclick="testResponse('${response.id}')">Test</button>
                    <button class="response-btn" onclick="editResponse('${response.id}')">Edit</button>
                </div>
            </div>
        `).join('');
    }
    
    renderTestingValidation() {
        const container = document.getElementById('testingValidationGrid');
        if (!container) return;
        
        container.innerHTML = this.testingValidation.map(test => `
            <div class="testing-item">
                <div class="testing-header">
                    <div class="testing-name">${test.name}</div>
                    <div class="testing-status ${test.status}">${test.status}</div>
                </div>
                <div class="testing-description">${test.description}</div>
                <div style="margin-bottom: var(--space-3); font-size: var(--text-xs); color: var(--neutral-500);">
                    <strong>Last Run:</strong> ${this.formatTime(test.lastRun)}<br>
                    <strong>Next Scheduled:</strong> ${this.formatTime(test.nextScheduled)}<br>
                    <strong>Issues Found:</strong> ${test.results.issuesFound}
                </div>
                <div class="testing-actions">
                    <button class="testing-btn" onclick="viewTestDetails('${test.id}')">View Details</button>
                    <button class="testing-btn" onclick="runTest('${test.id}')">Run Test</button>
                    <button class="testing-btn" onclick="scheduleTest('${test.id}')">Schedule</button>
                </div>
            </div>
        `).join('');
    }
    
    formatTime(timestamp) {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        return date.toLocaleDateString();
    }
    
    initializeUI() {
        // Initialize any UI components
    }
    
    setupEventListeners() {
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        window.initiateRecovery = () => this.initiateRecovery();
        window.runDisasterTest = () => this.runDisasterTest();
        window.refreshRecovery = () => this.refreshRecovery();
        window.exportRecovery = () => this.exportRecovery();
        window.switchTab = (tabName) => this.switchTab(tabName);
        window.viewPlanDetails = (planId) => this.viewPlanDetails(planId);
        window.testPlan = (planId) => this.testPlan(planId);
        window.editPlan = (planId) => this.editPlan(planId);
        window.viewContinuityDetails = (continuityId) => this.viewContinuityDetails(continuityId);
        window.testContinuity = (continuityId) => this.testContinuity(continuityId);
        window.editContinuity = (continuityId) => this.editContinuity(continuityId);
        window.viewResponseDetails = (responseId) => this.viewResponseDetails(responseId);
        window.testResponse = (responseId) => this.testResponse(responseId);
        window.editResponse = (responseId) => this.editResponse(responseId);
        window.viewTestDetails = (testId) => this.viewTestDetails(testId);
        window.runTest = (testId) => this.runTest(testId);
        window.scheduleTest = (testId) => this.scheduleTest(testId);
    }
    
    setupRealTimeUpdates() {
        if (!this.onSnapshot) return;
        
        const plansRef = this.collection(this.db, 'recovery_plans');
        this.onSnapshot(plansRef, (snapshot) => {
            this.recoveryPlans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateOverviewStats();
            this.renderRecoveryPlans();
        });
        
        const continuityRef = this.collection(this.db, 'business_continuity');
        this.onSnapshot(continuityRef, (snapshot) => {
            this.businessContinuity = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderBusinessContinuity();
        });
        
        const responseRef = this.collection(this.db, 'emergency_response');
        this.onSnapshot(responseRef, (snapshot) => {
            this.emergencyResponse = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.renderEmergencyResponse();
        });
        
        const testingRef = this.collection(this.db, 'testing_validation');
        this.onSnapshot(testingRef, (snapshot) => {
            this.testingValidation = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            this.updateOverviewStats();
            this.renderTestingValidation();
        });
    }
    
    // Utility methods
    showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-500)' : 
                        type === 'error' ? 'var(--error-500)' : 
                        type === 'warning' ? 'var(--warning-500)' : 'var(--info-500)'};
            color: white;
            padding: var(--space-4);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            max-width: 300px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    window.disasterRecoveryCore = new DisasterRecoveryCore();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DisasterRecoveryCore;
}
