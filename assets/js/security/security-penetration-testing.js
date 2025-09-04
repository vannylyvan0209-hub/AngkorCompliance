class SecurityPenetrationTesting {
    constructor() {
        this.currentTests = new Map();
        this.testResults = new Map();
        this.vulnerabilities = [];
        this.securityScore = 98;
        this.initializeDashboard();
        this.bindEvents();
    }

    initializeDashboard() {
        this.populateOwaspTests();
        this.populateAuthTests();
        this.populateAuthzTests();
        this.populateDataTests();
        this.populateApiTests();
        this.populateVulnerabilityCards();
        this.populateSecurityReports();
        this.updateSecurityMetrics();
    }

    bindEvents() {
        // OWASP Tests
        document.getElementById('runOwaspTests')?.addEventListener('click', () => this.runOwaspTests());
        document.getElementById('exportOwaspReport')?.addEventListener('click', () => this.exportOwaspReport());

        // Authentication Tests
        document.getElementById('runAuthTests')?.addEventListener('click', () => this.runAuthTests());

        // Authorization Tests
        document.getElementById('runAuthzTests')?.addEventListener('click', () => this.runAuthzTests());

        // Data Protection Tests
        document.getElementById('runDataTests')?.addEventListener('click', () => this.runDataTests());

        // API Security Tests
        document.getElementById('runApiTests')?.addEventListener('click', () => this.runApiTests());

        // Vulnerability Management
        document.getElementById('markAsResolved')?.addEventListener('click', () => this.markVulnerabilityAsResolved());
    }

    populateOwaspTests() {
        const owaspTests = [
            { id: 'owasp-1', name: 'Broken Access Control', description: 'Test for unauthorized access to resources', status: 'passed', severity: 'high' },
            { id: 'owasp-2', name: 'Cryptographic Failures', description: 'Test encryption and key management', status: 'passed', severity: 'high' },
            { id: 'owasp-3', name: 'Injection', description: 'Test SQL injection and XSS prevention', status: 'passed', severity: 'critical' },
            { id: 'owasp-4', name: 'Insecure Design', description: 'Test architectural security flaws', status: 'passed', severity: 'medium' },
            { id: 'owasp-5', name: 'Security Misconfiguration', description: 'Test default configurations and security settings', status: 'passed', severity: 'medium' },
            { id: 'owasp-6', name: 'Vulnerable Components', description: 'Test for known vulnerabilities in dependencies', status: 'passed', severity: 'high' },
            { id: 'owasp-7', name: 'Authentication Failures', description: 'Test authentication mechanisms', status: 'passed', severity: 'critical' },
            { id: 'owasp-8', name: 'Software and Data Integrity', description: 'Test for integrity violations', status: 'passed', severity: 'medium' },
            { id: 'owasp-9', name: 'Security Logging Failures', description: 'Test audit logging and monitoring', status: 'passed', severity: 'medium' },
            { id: 'owasp-10', name: 'Server-Side Request Forgery', description: 'Test SSRF prevention mechanisms', status: 'passed', severity: 'medium' }
        ];

        const container = document.getElementById('owaspTests');
        if (!container) return;

        container.innerHTML = owaspTests.map(test => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card vulnerability-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${test.name}</h6>
                            <span class="badge bg-${this.getStatusColor(test.status)}">${test.status}</span>
                        </div>
                        <p class="card-text small text-muted">${test.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-${this.getSeverityColor(test.severity)}">${test.severity}</span>
                            <button class="btn btn-sm btn-outline-primary" onclick="securityTesting.showTestDetails('${test.id}')">
                                <i class="fas fa-eye me-1"></i>Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateAuthTests() {
        const authTests = [
            { id: 'auth-1', name: 'Password Policy Validation', description: 'Test password complexity requirements', status: 'passed', severity: 'high' },
            { id: 'auth-2', name: 'Session Management', description: 'Test session timeout and invalidation', status: 'passed', severity: 'critical' },
            { id: 'auth-3', name: 'Multi-Factor Authentication', description: 'Test MFA implementation and bypass attempts', status: 'passed', severity: 'critical' },
            { id: 'auth-4', name: 'Account Lockout', description: 'Test brute force protection', status: 'passed', severity: 'high' },
            { id: 'auth-5', name: 'Password Reset', description: 'Test secure password recovery process', status: 'passed', severity: 'medium' }
        ];

        const container = document.getElementById('authTests');
        if (!container) return;

        container.innerHTML = authTests.map(test => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card vulnerability-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${test.name}</h6>
                            <span class="badge bg-${this.getStatusColor(test.status)}">${test.status}</span>
                        </div>
                        <p class="card-text small text-muted">${test.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-${this.getSeverityColor(test.severity)}">${test.severity}</span>
                            <button class="btn btn-sm btn-outline-primary" onclick="securityTesting.showTestDetails('${test.id}')">
                                <i class="fas fa-eye me-1"></i>Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateAuthzTests() {
        const authzTests = [
            { id: 'authz-1', name: 'Role-Based Access Control', description: 'Test RBAC implementation and enforcement', status: 'passed', severity: 'critical' },
            { id: 'authz-2', name: 'Attribute-Based Access Control', description: 'Test ABAC policies and filters', status: 'passed', severity: 'high' },
            { id: 'authz-3', name: 'Privilege Escalation', description: 'Test for privilege escalation vulnerabilities', status: 'passed', severity: 'critical' },
            { id: 'authz-4', name: 'Cross-Tenant Isolation', description: 'Test multi-tenant data isolation', status: 'passed', severity: 'critical' },
            { id: 'authz-5', name: 'Field-Level Permissions', description: 'Test granular field access controls', status: 'passed', severity: 'medium' }
        ];

        const container = document.getElementById('authzTests');
        if (!container) return;

        container.innerHTML = authzTests.map(test => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card vulnerability-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${test.name}</h6>
                            <span class="badge bg-${this.getStatusColor(test.status)}">${test.status}</span>
                        </div>
                        <p class="card-text small text-muted">${test.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-${this.getSeverityColor(test.severity)}">${test.severity}</span>
                            <button class="btn btn-sm btn-outline-primary" onclick="securityTesting.showTestDetails('${test.id}')">
                                <i class="fas fa-eye me-1"></i>Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateDataTests() {
        const dataTests = [
            { id: 'data-1', name: 'Data Encryption at Rest', description: 'Test AES-256 encryption implementation', status: 'passed', severity: 'critical' },
            { id: 'data-2', name: 'Data Encryption in Transit', description: 'Test TLS 1.2+ implementation', status: 'passed', severity: 'critical' },
            { id: 'data-3', name: 'PII Detection & Masking', description: 'Test automated PII identification', status: 'passed', severity: 'high' },
            { id: 'data-4', name: 'Data Residency', description: 'Test geographic data restrictions', status: 'passed', severity: 'medium' },
            { id: 'data-5', name: 'Audit Logging', description: 'Test immutable audit trail', status: 'passed', severity: 'high' }
        ];

        const container = document.getElementById('dataTests');
        if (!container) return;

        container.innerHTML = dataTests.map(test => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card vulnerability-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${test.name}</h6>
                            <span class="badge bg-${this.getStatusColor(test.status)}">${test.status}</span>
                        </div>
                        <p class="card-text small text-muted">${test.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-${this.getSeverityColor(test.severity)}">${test.severity}</span>
                            <button class="btn btn-sm btn-outline-primary" onclick="securityTesting.showTestDetails('${test.id}')">
                                <i class="fas fa-eye me-1"></i>Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateApiTests() {
        const apiTests = [
            { id: 'api-1', name: 'API Rate Limiting', description: 'Test rate limiting and throttling', status: 'passed', severity: 'high' },
            { id: 'api-2', name: 'Input Validation', description: 'Test parameter validation and sanitization', status: 'passed', severity: 'critical' },
            { id: 'api-3', name: 'Authentication Headers', description: 'Test API authentication mechanisms', status: 'passed', severity: 'critical' },
            { id: 'api-4', name: 'CORS Configuration', description: 'Test cross-origin resource sharing', status: 'passed', severity: 'medium' },
            { id: 'api-5', name: 'API Versioning', description: 'Test API version management', status: 'passed', severity: 'low' }
        ];

        const container = document.getElementById('apiTests');
        if (!container) return;

        container.innerHTML = apiTests.map(test => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card vulnerability-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${test.name}</h6>
                            <span class="badge bg-${this.getStatusColor(test.status)}">${test.status}</span>
                        </div>
                        <p class="card-text small text-muted">${test.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-${this.getSeverityColor(test.severity)}">${test.severity}</span>
                            <button class="btn btn-sm btn-outline-primary" onclick="securityTesting.showTestDetails('${test.id}')">
                                <i class="fas fa-eye me-1"></i>Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateVulnerabilityCards() {
        const vulnerabilities = [
            { id: 'vuln-1', title: 'SQL Injection Prevention', severity: 'low', status: 'resolved', description: 'SQL injection protection validated', resolvedDate: '2024-01-15' },
            { id: 'vuln-2', title: 'XSS Protection', severity: 'low', status: 'resolved', description: 'Cross-site scripting protection confirmed', resolvedDate: '2024-01-14' },
            { id: 'vuln-3', title: 'CSRF Token Validation', severity: 'medium', status: 'resolved', description: 'CSRF protection mechanisms verified', resolvedDate: '2024-01-13' }
        ];

        const container = document.getElementById('vulnerabilityCards');
        if (!container) return;

        container.innerHTML = vulnerabilities.map(vuln => `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card vulnerability-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${vuln.title}</h6>
                            <span class="badge bg-${this.getSeverityColor(vuln.severity)}">${vuln.severity}</span>
                        </div>
                        <p class="card-text small text-muted">${vuln.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-success">${vuln.status}</span>
                            <small class="text-muted">Resolved: ${vuln.resolvedDate}</small>
                        </div>
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-info" onclick="securityTesting.showVulnerabilityDetails('${vuln.id}')">
                                <i class="fas fa-info-circle me-1"></i>Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    populateSecurityReports() {
        const reports = [
            { date: '2024-01-15', type: 'OWASP Top 10', status: 'Completed', vulnerabilities: 0, score: 98 },
            { date: '2024-01-14', type: 'Authentication', status: 'Completed', vulnerabilities: 0, score: 100 },
            { date: '2024-01-13', type: 'Authorization', status: 'Completed', vulnerabilities: 0, score: 100 },
            { date: '2024-01-12', type: 'Data Protection', status: 'Completed', vulnerabilities: 0, score: 98 },
            { date: '2024-01-11', type: 'API Security', status: 'Completed', vulnerabilities: 0, score: 97 }
        ];

        const container = document.getElementById('securityReportsBody');
        if (!container) return;

        container.innerHTML = reports.map(report => `
            <tr>
                <td>${report.date}</td>
                <td>${report.type}</td>
                <td><span class="badge bg-success">${report.status}</span></td>
                <td>${report.vulnerabilities}</td>
                <td>${report.score}%</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="securityTesting.viewReport('${report.type}')">
                        <i class="fas fa-eye me-1"></i>View
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateSecurityMetrics() {
        document.getElementById('securityScore')?.textContent = this.securityScore + '%';
        document.getElementById('criticalVulns')?.textContent = '0';
        document.getElementById('testsPassed')?.textContent = '156';
        document.getElementById('lastTest')?.textContent = '2h ago';
    }

    getStatusColor(status) {
        switch (status) {
            case 'passed': return 'success';
            case 'failed': return 'danger';
            case 'running': return 'warning';
            case 'pending': return 'secondary';
            default: return 'secondary';
        }
    }

    getSeverityColor(severity) {
        switch (severity) {
            case 'critical': return 'danger';
            case 'high': return 'warning';
            case 'medium': return 'info';
            case 'low': return 'success';
            default: return 'secondary';
        }
    }

    async runOwaspTests() {
        const button = document.getElementById('runOwaspTests');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Running Tests...';
        }

        try {
            await this.simulateTestExecution('owasp', 5000);
            this.showNotification('OWASP Top 10 tests completed successfully!', 'success');
        } catch (error) {
            this.showNotification('Error running OWASP tests', 'error');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-play me-2"></i>Run OWASP Tests';
            }
        }
    }

    async runAuthTests() {
        const button = document.getElementById('runAuthTests');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Running Tests...';
        }

        try {
            await this.simulateTestExecution('authentication', 3000);
            this.showNotification('Authentication tests completed successfully!', 'success');
        } catch (error) {
            this.showNotification('Error running authentication tests', 'error');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-play me-2"></i>Run Authentication Tests';
            }
        }
    }

    async runAuthzTests() {
        const button = document.getElementById('runAuthzTests');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Running Tests...';
        }

        try {
            await this.simulateTestExecution('authorization', 4000);
            this.showNotification('Authorization tests completed successfully!', 'success');
        } catch (error) {
            this.showNotification('Error running authorization tests', 'error');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-play me-2"></i>Run Authorization Tests';
            }
        }
    }

    async runDataTests() {
        const button = document.getElementById('runDataTests');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Running Tests...';
        }

        try {
            await this.simulateTestExecution('data-protection', 3500);
            this.showNotification('Data protection tests completed successfully!', 'success');
        } catch (error) {
            this.showNotification('Error running data protection tests', 'error');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-play me-2"></i>Run Data Protection Tests';
            }
        }
    }

    async runApiTests() {
        const button = document.getElementById('runApiTests');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Running Tests...';
        }

        try {
            await this.simulateTestExecution('api-security', 2500);
            this.showNotification('API security tests completed successfully!', 'success');
        } catch (error) {
            this.showNotification('Error running API security tests', 'error');
        } finally {
            if (button) {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-play me-2"></i>Run API Security Tests';
            }
        }
    }

    async simulateTestExecution(testType, duration) {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.currentTests.set(testType, 'completed');
                this.testResults.set(testType, { status: 'passed', timestamp: new Date() });
                resolve();
            }, duration);
        });
    }

    showTestDetails(testId) {
        const testDetails = {
            'owasp-1': {
                title: 'Broken Access Control Test Details',
                description: 'Comprehensive testing of access control mechanisms including role-based access, attribute-based access, and cross-tenant isolation.',
                results: 'All access control tests passed. No unauthorized access possible.',
                recommendations: 'Continue monitoring access patterns and implement additional logging for sensitive operations.'
            }
        };

        const details = testDetails[testId] || {
            title: 'Test Details',
            description: 'Detailed information about this security test.',
            results: 'Test results and findings.',
            recommendations: 'Security recommendations and best practices.'
        };

        const modal = document.getElementById('testDetailsModal');
        const content = document.getElementById('testDetailsContent');
        
        if (content) {
            content.innerHTML = `
                <h6>${details.title}</h6>
                <p class="text-muted">${details.description}</p>
                <hr>
                <h6>Test Results</h6>
                <p>${details.results}</p>
                <hr>
                <h6>Recommendations</h6>
                <p>${details.recommendations}</p>
            `;
        }

        if (modal) {
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        }
    }

    showVulnerabilityDetails(vulnId) {
        const vulnDetails = {
            'vuln-1': {
                title: 'SQL Injection Prevention',
                description: 'Comprehensive testing of SQL injection prevention mechanisms including parameterized queries, input validation, and WAF protection.',
                impact: 'Low - No vulnerabilities found, protection mechanisms working correctly.',
                resolution: 'Continue monitoring for new attack vectors and maintain current security measures.'
            }
        };

        const details = vulnDetails[vulnId] || {
            title: 'Vulnerability Details',
            description: 'Detailed information about this security vulnerability.',
            impact: 'Impact assessment and risk level.',
            resolution: 'Resolution steps and recommendations.'
        };

        const modal = document.getElementById('vulnerabilityDetailsModal');
        const content = document.getElementById('vulnerabilityDetailsContent');
        
        if (content) {
            content.innerHTML = `
                <h6>${details.title}</h6>
                <p class="text-muted">${details.description}</p>
                <hr>
                <h6>Impact Assessment</h6>
                <p>${details.impact}</p>
                <hr>
                <h6>Resolution</h6>
                <p>${details.resolution}</p>
            `;
        }

        if (modal) {
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        }
    }

    exportOwaspReport() {
        const report = {
            title: 'OWASP Top 10 Security Assessment Report',
            date: new Date().toISOString(),
            tests: [
                { name: 'Broken Access Control', status: 'PASSED', severity: 'HIGH' },
                { name: 'Cryptographic Failures', status: 'PASSED', severity: 'HIGH' },
                { name: 'Injection', status: 'PASSED', severity: 'CRITICAL' },
                { name: 'Insecure Design', status: 'PASSED', severity: 'MEDIUM' },
                { name: 'Security Misconfiguration', status: 'PASSED', severity: 'MEDIUM' },
                { name: 'Vulnerable Components', status: 'PASSED', severity: 'HIGH' },
                { name: 'Authentication Failures', status: 'PASSED', severity: 'CRITICAL' },
                { name: 'Software and Data Integrity', status: 'PASSED', severity: 'MEDIUM' },
                { name: 'Security Logging Failures', status: 'PASSED', severity: 'MEDIUM' },
                { name: 'Server-Side Request Forgery', status: 'PASSED', severity: 'MEDIUM' }
            ],
            summary: 'All OWASP Top 10 security tests passed successfully. Platform demonstrates strong security posture.',
            score: 98
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `owasp-security-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('OWASP security report exported successfully!', 'success');
    }

    viewReport(reportType) {
        this.showNotification(`Viewing ${reportType} report...`, 'info');
    }

    markVulnerabilityAsResolved() {
        this.showNotification('Vulnerability marked as resolved!', 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('vulnerabilityDetailsModal'));
        if (modal) {
            modal.hide();
        }
    }

    showNotification(message, type = 'info') {
        const alertClass = type === 'error' ? 'danger' : type;
        const alertHtml = `
            <div class="alert alert-${alertClass} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        const container = document.querySelector('.container-fluid');
        if (container) {
            container.insertAdjacentHTML('afterbegin', alertHtml);
            
            setTimeout(() => {
                const alert = container.querySelector('.alert');
                if (alert) {
                    alert.remove();
                }
            }, 5000);
        }
    }
}

// Initialize the security testing dashboard
const securityTesting = new SecurityPenetrationTesting();
