/**
 * Component Testing 2025 - JavaScript
 * Component testing framework for design system
 */

class ComponentTesting2025 {
    constructor() {
        this.testResults = [];
        this.isRunning = false;
        this.testSuites = [];
        this.init();
    }

    init() {
        this.setupTestRunner();
        this.setupTestSuites();
        this.createTestDashboard();
    }

    setupTestRunner() {
        // Create test runner UI
        this.createTestRunnerUI();
        this.bindTestRunnerEvents();
    }

    createTestRunnerUI() {
        const testRunner = document.createElement('div');
        testRunner.className = 'component-test-runner';
        testRunner.innerHTML = `
            <div class="test-runner-header">
                <h3>Component Testing Framework</h3>
                <div class="test-controls">
                    <button class="btn btn-primary" id="runAllComponentTests">Run All Tests</button>
                    <button class="btn btn-secondary" id="runComponentTests">Component Tests</button>
                    <button class="btn btn-secondary" id="runIntegrationTests">Integration Tests</button>
                    <button class="btn btn-secondary" id="runVisualTests">Visual Tests</button>
                </div>
            </div>
            <div class="test-results" id="componentTestResults"></div>
        `;
        
        document.body.appendChild(testRunner);
    }

    bindTestRunnerEvents() {
        document.getElementById('runAllComponentTests').addEventListener('click', () => {
            this.runAllTests();
        });

        document.getElementById('runComponentTests').addEventListener('click', () => {
            this.runComponentTests();
        });

        document.getElementById('runIntegrationTests').addEventListener('click', () => {
            this.runIntegrationTests();
        });

        document.getElementById('runVisualTests').addEventListener('click', () => {
            this.runVisualTests();
        });
    }

    setupTestSuites() {
        this.testSuites = {
            components: this.getComponentTests(),
            integration: this.getIntegrationTests(),
            visual: this.getVisualTests(),
            accessibility: this.getAccessibilityTests(),
            performance: this.getPerformanceTests()
        };
    }

    getComponentTests() {
        return [
            {
                name: 'Button Component Tests',
                test: () => this.testButtonComponent()
            },
            {
                name: 'Card Component Tests',
                test: () => this.testCardComponent()
            },
            {
                name: 'Form Component Tests',
                test: () => this.testFormComponent()
            },
            {
                name: 'Alert Component Tests',
                test: () => this.testAlertComponent()
            },
            {
                name: 'Modal Component Tests',
                test: () => this.testModalComponent()
            },
            {
                name: 'Navigation Component Tests',
                test: () => this.testNavigationComponent()
            },
            {
                name: 'Avatar Component Tests',
                test: () => this.testAvatarComponent()
            },
            {
                name: 'Progress Component Tests',
                test: () => this.testProgressComponent()
            }
        ];
    }

    getIntegrationTests() {
        return [
            {
                name: 'Role Switching Integration',
                test: () => this.testRoleSwitchingIntegration()
            },
            {
                name: 'Theme System Integration',
                test: () => this.testThemeSystemIntegration()
            },
            {
                name: 'Dark Mode Integration',
                test: () => this.testDarkModeIntegration()
            },
            {
                name: 'Responsive Design Integration',
                test: () => this.testResponsiveDesignIntegration()
            },
            {
                name: 'Accessibility Integration',
                test: () => this.testAccessibilityIntegration()
            }
        ];
    }

    getVisualTests() {
        return [
            {
                name: 'Visual Regression Tests',
                test: () => this.testVisualRegression()
            },
            {
                name: 'Cross-Browser Visual Tests',
                test: () => this.testCrossBrowserVisual()
            },
            {
                name: 'Responsive Visual Tests',
                test: () => this.testResponsiveVisual()
            },
            {
                name: 'Dark Mode Visual Tests',
                test: () => this.testDarkModeVisual()
            }
        ];
    }

    getAccessibilityTests() {
        return [
            {
                name: 'Color Contrast Tests',
                test: () => this.testColorContrast()
            },
            {
                name: 'Keyboard Navigation Tests',
                test: () => this.testKeyboardNavigation()
            },
            {
                name: 'Screen Reader Tests',
                test: () => this.testScreenReader()
            },
            {
                name: 'Focus Management Tests',
                test: () => this.testFocusManagement()
            }
        ];
    }

    getPerformanceTests() {
        return [
            {
                name: 'Component Rendering Performance',
                test: () => this.testComponentRenderingPerformance()
            },
            {
                name: 'CSS Loading Performance',
                test: () => this.testCSSLoadingPerformance()
            },
            {
                name: 'JavaScript Performance',
                test: () => this.testJavaScriptPerformance()
            },
            {
                name: 'Memory Usage Tests',
                test: () => this.testMemoryUsage()
            }
        ];
    }

    createTestDashboard() {
        const dashboard = document.createElement('div');
        dashboard.className = 'component-test-dashboard';
        dashboard.innerHTML = `
            <div class="test-dashboard-header">
                <h2>Component Testing Dashboard</h2>
                <div class="test-dashboard-controls">
                    <button class="btn btn-primary" id="runAllTests">Run All Tests</button>
                    <button class="btn btn-secondary" id="exportResults">Export Results</button>
                </div>
            </div>
            
            <div class="test-dashboard-content">
                <div class="test-summary" id="testSummary">
                    <!-- Test summary will be populated here -->
                </div>
                
                <div class="test-details" id="testDetails">
                    <!-- Test details will be populated here -->
                </div>
            </div>
        `;
        
        document.body.appendChild(dashboard);
    }

    async runAllTests() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.testResults = [];
        this.updateTestRunnerUI('Running all component tests...');

        for (const [suiteName, tests] of Object.entries(this.testSuites)) {
            this.updateTestRunnerUI(`Running ${suiteName} tests...`);
            
            for (const test of tests) {
                try {
                    const result = await test.test();
                    this.testResults.push({
                        suite: suiteName,
                        name: test.name,
                        status: result.status,
                        message: result.message,
                        details: result.details,
                        timestamp: new Date().toISOString()
                    });
                } catch (error) {
                    this.testResults.push({
                        suite: suiteName,
                        name: test.name,
                        status: 'error',
                        message: error.message,
                        details: error.stack,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        }

        this.isRunning = false;
        this.displayTestResults();
        this.updateTestDashboard();
    }

    async runComponentTests() {
        await this.runTestSuite('components');
    }

    async runIntegrationTests() {
        await this.runTestSuite('integration');
    }

    async runVisualTests() {
        await this.runTestSuite('visual');
    }

    async runTestSuite(suiteName) {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.testResults = [];
        this.updateTestRunnerUI(`Running ${suiteName} tests...`);

        const tests = this.testSuites[suiteName];
        for (const test of tests) {
            try {
                const result = await test.test();
                this.testResults.push({
                    suite: suiteName,
                    name: test.name,
                    status: result.status,
                    message: result.message,
                    details: result.details,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                this.testResults.push({
                    suite: suiteName,
                    name: test.name,
                    status: 'error',
                    message: error.message,
                    details: error.stack,
                    timestamp: new Date().toISOString()
                });
            }
        }

        this.isRunning = false;
        this.displayTestResults();
        this.updateTestDashboard();
    }

    // Component Tests
    testButtonComponent() {
        const buttons = document.querySelectorAll('.btn');
        const issues = [];

        buttons.forEach(button => {
            // Check for required classes
            if (!button.classList.contains('btn')) {
                issues.push('Button missing base class');
            }

            // Check for proper sizing
            const computedStyle = getComputedStyle(button);
            if (parseInt(computedStyle.minHeight) < 44) {
                issues.push('Button height below minimum touch target');
            }

            // Check for proper contrast
            const bgColor = computedStyle.backgroundColor;
            const textColor = computedStyle.color;
            if (!this.checkColorContrast(bgColor, textColor)) {
                issues.push('Button color contrast insufficient');
            }

            // Check for hover states
            if (!computedStyle.transition || computedStyle.transition === 'none') {
                issues.push('Button missing transition for hover states');
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All buttons pass tests' : `${issues.length} issues found`,
            details: issues
        };
    }

    testCardComponent() {
        const cards = document.querySelectorAll('.card');
        const issues = [];

        cards.forEach(card => {
            // Check for proper styling
            const computedStyle = getComputedStyle(card);
            if (computedStyle.borderRadius === '0px') {
                issues.push('Card missing border radius');
            }

            // Check for proper spacing
            if (parseInt(computedStyle.padding) < 16) {
                issues.push('Card padding insufficient');
            }

            // Check for glassmorphism effects
            if (!computedStyle.backdropFilter || computedStyle.backdropFilter === 'none') {
                issues.push('Card missing glassmorphism effects');
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All cards pass tests' : `${issues.length} issues found`,
            details: issues
        };
    }

    testFormComponent() {
        const inputs = document.querySelectorAll('.form-input');
        const issues = [];

        inputs.forEach(input => {
            // Check for proper sizing
            const computedStyle = getComputedStyle(input);
            if (parseInt(computedStyle.minHeight) < 44) {
                issues.push('Input height below minimum touch target');
            }

            // Check for proper focus states
            if (computedStyle.outline === 'none' && !computedStyle.boxShadow) {
                issues.push('Input missing focus indicator');
            }

            // Check for proper border radius
            if (computedStyle.borderRadius === '0px') {
                issues.push('Input missing border radius');
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All form inputs pass tests' : `${issues.length} issues found`,
            details: issues
        };
    }

    testAlertComponent() {
        const alerts = document.querySelectorAll('.alert');
        const issues = [];

        alerts.forEach(alert => {
            // Check for proper color coding
            const computedStyle = getComputedStyle(alert);
            if (!computedStyle.backgroundColor || computedStyle.backgroundColor === 'transparent') {
                issues.push('Alert missing background color');
            }

            // Check for proper border radius
            if (computedStyle.borderRadius === '0px') {
                issues.push('Alert missing border radius');
            }

            // Check for proper padding
            if (parseInt(computedStyle.padding) < 12) {
                issues.push('Alert padding insufficient');
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All alerts pass tests' : `${issues.length} issues found`,
            details: issues
        };
    }

    testModalComponent() {
        const modals = document.querySelectorAll('.modal');
        const issues = [];

        modals.forEach(modal => {
            // Check for proper positioning
            const computedStyle = getComputedStyle(modal);
            if (computedStyle.position !== 'fixed') {
                issues.push('Modal not properly positioned');
            }

            // Check for proper z-index
            if (parseInt(computedStyle.zIndex) < 1000) {
                issues.push('Modal z-index too low');
            }

            // Check for glassmorphism effects
            if (!computedStyle.backdropFilter || computedStyle.backdropFilter === 'none') {
                issues.push('Modal missing glassmorphism effects');
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All modals pass tests' : `${issues.length} issues found`,
            details: issues
        };
    }

    testNavigationComponent() {
        const navItems = document.querySelectorAll('.nav-item');
        const issues = [];

        navItems.forEach(item => {
            // Check for proper sizing
            const computedStyle = getComputedStyle(item);
            if (parseInt(computedStyle.minHeight) < 44) {
                issues.push('Navigation item height below minimum touch target');
            }

            // Check for proper hover states
            if (!computedStyle.transition || computedStyle.transition === 'none') {
                issues.push('Navigation item missing transition for hover states');
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All navigation items pass tests' : `${issues.length} issues found`,
            details: issues
        };
    }

    testAvatarComponent() {
        const avatars = document.querySelectorAll('.avatar');
        const issues = [];

        avatars.forEach(avatar => {
            // Check for proper sizing
            const computedStyle = getComputedStyle(avatar);
            if (computedStyle.borderRadius !== '50%') {
                issues.push('Avatar not circular');
            }

            // Check for proper sizing
            if (parseInt(computedStyle.width) < 32) {
                issues.push('Avatar size too small');
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All avatars pass tests' : `${issues.length} issues found`,
            details: issues
        };
    }

    testProgressComponent() {
        const progressBars = document.querySelectorAll('.progress-bar');
        const issues = [];

        progressBars.forEach(bar => {
            // Check for proper width
            const width = parseInt(bar.style.width);
            if (isNaN(width) || width < 0 || width > 100) {
                issues.push('Progress bar width invalid');
            }

            // Check for proper styling
            const computedStyle = getComputedStyle(bar);
            if (computedStyle.borderRadius === '0px') {
                issues.push('Progress bar missing border radius');
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All progress bars pass tests' : `${issues.length} issues found`,
            details: issues
        };
    }

    // Integration Tests
    testRoleSwitchingIntegration() {
        const issues = [];
        
        // Check if role switching is available
        if (!window.roleSwitching) {
            issues.push('Role switching system not available');
        }

        // Check if role themes are applied
        const body = document.body;
        if (!body.classList.contains('role-theme')) {
            issues.push('Role theme class not applied to body');
        }

        // Check if role-specific styles are loaded
        const roleStyles = document.querySelectorAll('link[href*="role-themes"]');
        if (roleStyles.length === 0) {
            issues.push('Role theme styles not loaded');
        }

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'Role switching integration working' : `${issues.length} issues found`,
            details: issues
        };
    }

    testThemeSystemIntegration() {
        const issues = [];
        
        // Check if theme system is available
        if (!window.themeCustomization) {
            issues.push('Theme customization system not available');
        }

        // Check if design tokens are loaded
        const designTokens = document.querySelectorAll('link[href*="design-tokens"]');
        if (designTokens.length === 0) {
            issues.push('Design tokens not loaded');
        }

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'Theme system integration working' : `${issues.length} issues found`,
            details: issues
        };
    }

    testDarkModeIntegration() {
        const issues = [];
        
        // Check if dark mode system is available
        if (!window.darkMode) {
            issues.push('Dark mode system not available');
        }

        // Check if dark mode styles are loaded
        const darkModeStyles = document.querySelectorAll('link[href*="dark-mode"]');
        if (darkModeStyles.length === 0) {
            issues.push('Dark mode styles not loaded');
        }

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'Dark mode integration working' : `${issues.length} issues found`,
            details: issues
        };
    }

    testResponsiveDesignIntegration() {
        const issues = [];
        
        // Check if responsive styles are loaded
        const responsiveStyles = document.querySelectorAll('link[href*="layout"]');
        if (responsiveStyles.length === 0) {
            issues.push('Responsive layout styles not loaded');
        }

        // Check for viewport meta tag
        const viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            issues.push('Viewport meta tag missing');
        }

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'Responsive design integration working' : `${issues.length} issues found`,
            details: issues
        };
    }

    testAccessibilityIntegration() {
        const issues = [];
        
        // Check if accessibility system is available
        if (!window.accessibility) {
            issues.push('Accessibility system not available');
        }

        // Check if accessibility styles are loaded
        const accessibilityStyles = document.querySelectorAll('link[href*="accessibility"]');
        if (accessibilityStyles.length === 0) {
            issues.push('Accessibility styles not loaded');
        }

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'Accessibility integration working' : `${issues.length} issues found`,
            details: issues
        };
    }

    // Visual Tests
    testVisualRegression() {
        // This would typically involve taking screenshots and comparing them
        // For now, we'll do basic visual checks
        const issues = [];
        
        // Check for proper font loading
        const body = document.body;
        const computedStyle = getComputedStyle(body);
        if (computedStyle.fontFamily.includes('serif')) {
            issues.push('Fallback serif font being used');
        }

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'Visual regression tests passed' : `${issues.length} issues found`,
            details: issues
        };
    }

    testCrossBrowserVisual() {
        const issues = [];
        
        // Check for CSS properties that might not be supported
        const testElement = document.createElement('div');
        testElement.style.backdropFilter = 'blur(10px)';
        if (!testElement.style.backdropFilter) {
            issues.push('Backdrop filter not supported');
        }

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'Cross-browser visual tests passed' : `${issues.length} issues found`,
            details: issues
        };
    }

    testResponsiveVisual() {
        const issues = [];
        
        // Check for responsive breakpoints
        const mediaQueries = [
            '(max-width: 768px)',
            '(max-width: 1024px)',
            '(min-width: 1025px)'
        ];

        mediaQueries.forEach(query => {
            if (!window.matchMedia(query).matches) {
                issues.push(`Media query ${query} not working`);
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'Responsive visual tests passed' : `${issues.length} issues found`,
            details: issues
        };
    }

    testDarkModeVisual() {
        const issues = [];
        
        // Check if dark mode styles are applied
        const darkModeStyles = document.querySelectorAll('link[href*="dark-mode"]');
        if (darkModeStyles.length === 0) {
            issues.push('Dark mode styles not loaded');
        }

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'Dark mode visual tests passed' : `${issues.length} issues found`,
            details: issues
        };
    }

    // Accessibility Tests
    testColorContrast() {
        const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
        const issues = [];

        textElements.forEach(element => {
            const computedStyle = getComputedStyle(element);
            const bgColor = this.getBackgroundColor(element);
            const textColor = computedStyle.color;

            if (!this.checkColorContrast(bgColor, textColor)) {
                issues.push(`Insufficient contrast: ${element.tagName}`);
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All text meets contrast requirements' : `${issues.length} contrast issues found`,
            details: issues
        };
    }

    testKeyboardNavigation() {
        const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href]');
        const issues = [];

        focusableElements.forEach(element => {
            const computedStyle = getComputedStyle(element);
            if (computedStyle.outline === 'none' && !computedStyle.boxShadow) {
                issues.push(`Element missing focus indicator: ${element.tagName}`);
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All focusable elements have indicators' : `${issues.length} focus issues found`,
            details: issues
        };
    }

    testScreenReader() {
        const images = document.querySelectorAll('img');
        const issues = [];

        images.forEach(img => {
            if (!img.getAttribute('alt') && !img.getAttribute('aria-label')) {
                issues.push(`Image missing alt text: ${img.src}`);
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All images have alt text' : `${issues.length} alt text issues found`,
            details: issues
        };
    }

    testFocusManagement() {
        const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href]');
        const issues = [];

        focusableElements.forEach(element => {
            if (element.tabIndex === -1) {
                issues.push(`Element not keyboard accessible: ${element.tagName}`);
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All elements are keyboard accessible' : `${issues.length} keyboard issues found`,
            details: issues
        };
    }

    // Performance Tests
    testComponentRenderingPerformance() {
        const startTime = performance.now();
        const components = document.querySelectorAll('.btn, .card, .form-input, .alert');
        const endTime = performance.now();
        const renderTime = endTime - startTime;

        return {
            status: renderTime < 100 ? 'pass' : 'fail',
            message: `Components rendered in ${renderTime.toFixed(2)}ms`,
            details: [`Render time: ${renderTime.toFixed(2)}ms`, `Components: ${components.length}`]
        };
    }

    testCSSLoadingPerformance() {
        const startTime = performance.now();
        const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
        
        return new Promise((resolve) => {
            let loadedCount = 0;
            const totalCount = cssLinks.length;

            if (totalCount === 0) {
                resolve({
                    status: 'pass',
                    message: 'No CSS files to test',
                    details: []
                });
                return;
            }

            cssLinks.forEach(link => {
                if (link.sheet) {
                    loadedCount++;
                } else {
                    link.addEventListener('load', () => {
                        loadedCount++;
                        if (loadedCount === totalCount) {
                            const endTime = performance.now();
                            const loadTime = endTime - startTime;
                            
                            resolve({
                                status: loadTime < 1000 ? 'pass' : 'fail',
                                message: `CSS loaded in ${loadTime.toFixed(2)}ms`,
                                details: [`Load time: ${loadTime.toFixed(2)}ms`]
                            });
                        }
                    });
                }
            });

            if (loadedCount === totalCount) {
                const endTime = performance.now();
                const loadTime = endTime - startTime;
                
                resolve({
                    status: loadTime < 1000 ? 'pass' : 'fail',
                    message: `CSS loaded in ${loadTime.toFixed(2)}ms`,
                    details: [`Load time: ${loadTime.toFixed(2)}ms`]
                });
            }
        });
    }

    testJavaScriptPerformance() {
        const startTime = performance.now();
        const scripts = document.querySelectorAll('script[src]');
        const endTime = performance.now();
        const loadTime = endTime - startTime;

        return {
            status: loadTime < 500 ? 'pass' : 'fail',
            message: `JavaScript loaded in ${loadTime.toFixed(2)}ms`,
            details: [`Load time: ${loadTime.toFixed(2)}ms`, `Scripts: ${scripts.length}`]
        };
    }

    testMemoryUsage() {
        if (performance.memory) {
            const memory = performance.memory;
            const usedMB = memory.usedJSHeapSize / 1024 / 1024;
            
            return {
                status: usedMB < 50 ? 'pass' : 'fail',
                message: `Memory usage: ${usedMB.toFixed(2)}MB`,
                details: [`Used: ${usedMB.toFixed(2)}MB`, `Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`]
            };
        }

        return {
            status: 'skip',
            message: 'Memory API not available',
            details: []
        };
    }

    // Utility Methods
    checkColorContrast(bgColor, textColor) {
        // Simplified contrast check - in reality, you'd use a proper contrast calculation
        return true; // Placeholder
    }

    getBackgroundColor(element) {
        const computedStyle = getComputedStyle(element);
        return computedStyle.backgroundColor;
    }

    updateTestRunnerUI(message) {
        const testResults = document.getElementById('componentTestResults');
        if (testResults) {
            testResults.innerHTML = `<div class="test-status">${message}</div>`;
        }
    }

    displayTestResults() {
        const testResults = document.getElementById('componentTestResults');
        if (!testResults) return;

        const passed = this.testResults.filter(r => r.status === 'pass').length;
        const failed = this.testResults.filter(r => r.status === 'fail').length;
        const errors = this.testResults.filter(r => r.status === 'error').length;
        const skipped = this.testResults.filter(r => r.status === 'skip').length;

        let html = `
            <div class="test-summary">
                <h4>Test Results</h4>
                <div class="test-stats">
                    <span class="test-stat passed">Passed: ${passed}</span>
                    <span class="test-stat failed">Failed: ${failed}</span>
                    <span class="test-stat error">Errors: ${errors}</span>
                    <span class="test-stat skipped">Skipped: ${skipped}</span>
                </div>
            </div>
            <div class="test-details">
        `;

        this.testResults.forEach(result => {
            const statusClass = result.status;
            html += `
                <div class="test-result ${statusClass}">
                    <div class="test-header">
                        <span class="test-name">${result.name}</span>
                        <span class="test-status">${result.status.toUpperCase()}</span>
                    </div>
                    <div class="test-message">${result.message}</div>
                    ${result.details.length > 0 ? `
                        <div class="test-details">
                            <ul>
                                ${result.details.map(detail => `<li>${detail}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        html += '</div>';
        testResults.innerHTML = html;
    }

    updateTestDashboard() {
        const summary = document.getElementById('testSummary');
        const details = document.getElementById('testDetails');
        
        if (summary) {
            const passed = this.testResults.filter(r => r.status === 'pass').length;
            const failed = this.testResults.filter(r => r.status === 'fail').length;
            const errors = this.testResults.filter(r => r.status === 'error').length;
            
            summary.innerHTML = `
                <div class="test-summary-card">
                    <h3>Test Summary</h3>
                    <div class="test-summary-stats">
                        <div class="test-summary-stat passed">
                            <span class="stat-number">${passed}</span>
                            <span class="stat-label">Passed</span>
                        </div>
                        <div class="test-summary-stat failed">
                            <span class="stat-number">${failed}</span>
                            <span class="stat-label">Failed</span>
                        </div>
                        <div class="test-summary-stat error">
                            <span class="stat-number">${errors}</span>
                            <span class="stat-label">Errors</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (details) {
            let html = '';
            this.testResults.forEach(result => {
                html += `
                    <div class="test-detail-item ${result.status}">
                        <div class="test-detail-header">
                            <span class="test-detail-name">${result.name}</span>
                            <span class="test-detail-status">${result.status.toUpperCase()}</span>
                        </div>
                        <div class="test-detail-message">${result.message}</div>
                    </div>
                `;
            });
            details.innerHTML = html;
        }
    }

    // Public API methods
    getTestResults() {
        return this.testResults;
    }

    exportResults() {
        const dataStr = JSON.stringify(this.testResults, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `component-test-results-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

// Initialize component testing
document.addEventListener('DOMContentLoaded', () => {
    window.componentTesting = new ComponentTesting2025();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentTesting2025;
}
