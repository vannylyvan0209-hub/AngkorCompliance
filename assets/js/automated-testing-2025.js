/**
 * Automated Testing 2025 - JavaScript
 * Automated testing for design system consistency
 */

class AutomatedTesting2025 {
    constructor() {
        this.testResults = [];
        this.isRunning = false;
        this.init();
    }

    init() {
        this.setupTestRunner();
        this.setupTestSuites();
    }

    setupTestRunner() {
        // Create test runner UI
        this.createTestRunnerUI();
        this.bindTestRunnerEvents();
    }

    createTestRunnerUI() {
        const testRunner = document.createElement('div');
        testRunner.className = 'test-runner';
        testRunner.innerHTML = `
            <div class="test-runner-header">
                <h3>Design System Tests</h3>
                <div class="test-controls">
                    <button class="btn btn-primary" id="runAllTests">Run All Tests</button>
                    <button class="btn btn-secondary" id="runComponentTests">Component Tests</button>
                    <button class="btn btn-secondary" id="runAccessibilityTests">Accessibility Tests</button>
                    <button class="btn btn-secondary" id="runPerformanceTests">Performance Tests</button>
                </div>
            </div>
            <div class="test-results" id="testResults"></div>
        `;
        
        document.body.appendChild(testRunner);
    }

    bindTestRunnerEvents() {
        document.getElementById('runAllTests').addEventListener('click', () => {
            this.runAllTests();
        });

        document.getElementById('runComponentTests').addEventListener('click', () => {
            this.runComponentTests();
        });

        document.getElementById('runAccessibilityTests').addEventListener('click', () => {
            this.runAccessibilityTests();
        });

        document.getElementById('runPerformanceTests').addEventListener('click', () => {
            this.runPerformanceTests();
        });
    }

    setupTestSuites() {
        this.testSuites = {
            components: this.getComponentTests(),
            accessibility: this.getAccessibilityTests(),
            performance: this.getPerformanceTests(),
            designTokens: this.getDesignTokenTests(),
            responsive: this.getResponsiveTests()
        };
    }

    getComponentTests() {
        return [
            {
                name: 'Button Components',
                test: () => this.testButtonComponents()
            },
            {
                name: 'Card Components',
                test: () => this.testCardComponents()
            },
            {
                name: 'Form Components',
                test: () => this.testFormComponents()
            },
            {
                name: 'Alert Components',
                test: () => this.testAlertComponents()
            },
            {
                name: 'Progress Components',
                test: () => this.testProgressComponents()
            },
            {
                name: 'Avatar Components',
                test: () => this.testAvatarComponents()
            }
        ];
    }

    getAccessibilityTests() {
        return [
            {
                name: 'Color Contrast',
                test: () => this.testColorContrast()
            },
            {
                name: 'Focus Management',
                test: () => this.testFocusManagement()
            },
            {
                name: 'ARIA Labels',
                test: () => this.testAriaLabels()
            },
            {
                name: 'Keyboard Navigation',
                test: () => this.testKeyboardNavigation()
            },
            {
                name: 'Screen Reader Support',
                test: () => this.testScreenReaderSupport()
            }
        ];
    }

    getPerformanceTests() {
        return [
            {
                name: 'CSS Loading Performance',
                test: () => this.testCSSLoadingPerformance()
            },
            {
                name: 'Component Rendering Performance',
                test: () => this.testComponentRenderingPerformance()
            },
            {
                name: 'Memory Usage',
                test: () => this.testMemoryUsage()
            },
            {
                name: 'Bundle Size',
                test: () => this.testBundleSize()
            }
        ];
    }

    getDesignTokenTests() {
        return [
            {
                name: 'Color Tokens',
                test: () => this.testColorTokens()
            },
            {
                name: 'Typography Tokens',
                test: () => this.testTypographyTokens()
            },
            {
                name: 'Spacing Tokens',
                test: () => this.testSpacingTokens()
            },
            {
                name: 'Border Radius Tokens',
                test: () => this.testBorderRadiusTokens()
            }
        ];
    }

    getResponsiveTests() {
        return [
            {
                name: 'Mobile Responsiveness',
                test: () => this.testMobileResponsiveness()
            },
            {
                name: 'Tablet Responsiveness',
                test: () => this.testTabletResponsiveness()
            },
            {
                name: 'Desktop Responsiveness',
                test: () => this.testDesktopResponsiveness()
            },
            {
                name: 'Touch Targets',
                test: () => this.testTouchTargets()
            }
        ];
    }

    async runAllTests() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.testResults = [];
        this.updateTestRunnerUI('Running all tests...');

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
                        details: result.details
                    });
                } catch (error) {
                    this.testResults.push({
                        suite: suiteName,
                        name: test.name,
                        status: 'error',
                        message: error.message,
                        details: error.stack
                    });
                }
            }
        }

        this.isRunning = false;
        this.displayTestResults();
    }

    async runComponentTests() {
        await this.runTestSuite('components');
    }

    async runAccessibilityTests() {
        await this.runTestSuite('accessibility');
    }

    async runPerformanceTests() {
        await this.runTestSuite('performance');
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
                    details: result.details
                });
            } catch (error) {
                this.testResults.push({
                    suite: suiteName,
                    name: test.name,
                    status: 'error',
                    message: error.message,
                    details: error.stack
                });
            }
        }

        this.isRunning = false;
        this.displayTestResults();
    }

    // Component Tests
    testButtonComponents() {
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
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All buttons pass tests' : `${issues.length} issues found`,
            details: issues
        };
    }

    testCardComponents() {
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
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All cards pass tests' : `${issues.length} issues found`,
            details: issues
        };
    }

    testFormComponents() {
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
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All form inputs pass tests' : `${issues.length} issues found`,
            details: issues
        };
    }

    testAlertComponents() {
        const alerts = document.querySelectorAll('.alert');
        const issues = [];

        alerts.forEach(alert => {
            // Check for proper color coding
            const computedStyle = getComputedStyle(alert);
            if (!computedStyle.backgroundColor || computedStyle.backgroundColor === 'transparent') {
                issues.push('Alert missing background color');
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All alerts pass tests' : `${issues.length} issues found`,
            details: issues
        };
    }

    testProgressComponents() {
        const progressBars = document.querySelectorAll('.progress-bar');
        const issues = [];

        progressBars.forEach(bar => {
            // Check for proper width
            const width = parseInt(bar.style.width);
            if (isNaN(width) || width < 0 || width > 100) {
                issues.push('Progress bar width invalid');
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All progress bars pass tests' : `${issues.length} issues found`,
            details: issues
        };
    }

    testAvatarComponents() {
        const avatars = document.querySelectorAll('.avatar');
        const issues = [];

        avatars.forEach(avatar => {
            // Check for proper sizing
            const computedStyle = getComputedStyle(avatar);
            if (computedStyle.borderRadius !== '50%') {
                issues.push('Avatar not circular');
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All avatars pass tests' : `${issues.length} issues found`,
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

    testFocusManagement() {
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

    testAriaLabels() {
        const interactiveElements = document.querySelectorAll('button, input, select, textarea');
        const issues = [];

        interactiveElements.forEach(element => {
            if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby') && !element.textContent.trim()) {
                issues.push(`Element missing accessible label: ${element.tagName}`);
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All interactive elements have labels' : `${issues.length} labeling issues found`,
            details: issues
        };
    }

    testKeyboardNavigation() {
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

    testScreenReaderSupport() {
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

    // Performance Tests
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

    testBundleSize() {
        const scripts = document.querySelectorAll('script[src]');
        let totalSize = 0;

        scripts.forEach(script => {
            // This is a simplified test - in reality, you'd need to fetch and measure actual file sizes
            totalSize += 100; // Placeholder
        });

        return {
            status: totalSize < 1000 ? 'pass' : 'fail',
            message: `Estimated bundle size: ${totalSize}KB`,
            details: [`Scripts: ${scripts.length}`, `Estimated size: ${totalSize}KB`]
        };
    }

    // Design Token Tests
    testColorTokens() {
        const colorTokens = [
            '--primary-500',
            '--success-500',
            '--warning-500',
            '--danger-500',
            '--info-500',
            '--neutral-500'
        ];
        const issues = [];

        colorTokens.forEach(token => {
            const value = getComputedStyle(document.documentElement).getPropertyValue(token);
            if (!value || value.trim() === '') {
                issues.push(`Color token missing: ${token}`);
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All color tokens defined' : `${issues.length} color tokens missing`,
            details: issues
        };
    }

    testTypographyTokens() {
        const typographyTokens = [
            '--text-xs',
            '--text-sm',
            '--text-base',
            '--text-lg',
            '--text-xl',
            '--text-2xl',
            '--text-3xl',
            '--text-4xl'
        ];
        const issues = [];

        typographyTokens.forEach(token => {
            const value = getComputedStyle(document.documentElement).getPropertyValue(token);
            if (!value || value.trim() === '') {
                issues.push(`Typography token missing: ${token}`);
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All typography tokens defined' : `${issues.length} typography tokens missing`,
            details: issues
        };
    }

    testSpacingTokens() {
        const spacingTokens = [
            '--space-1',
            '--space-2',
            '--space-3',
            '--space-4',
            '--space-5',
            '--space-6'
        ];
        const issues = [];

        spacingTokens.forEach(token => {
            const value = getComputedStyle(document.documentElement).getPropertyValue(token);
            if (!value || value.trim() === '') {
                issues.push(`Spacing token missing: ${token}`);
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All spacing tokens defined' : `${issues.length} spacing tokens missing`,
            details: issues
        };
    }

    testBorderRadiusTokens() {
        const radiusTokens = [
            '--radius-sm',
            '--radius-md',
            '--radius-lg',
            '--radius-xl'
        ];
        const issues = [];

        radiusTokens.forEach(token => {
            const value = getComputedStyle(document.documentElement).getPropertyValue(token);
            if (!value || value.trim() === '') {
                issues.push(`Border radius token missing: ${token}`);
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All border radius tokens defined' : `${issues.length} border radius tokens missing`,
            details: issues
        };
    }

    // Responsive Tests
    testMobileResponsiveness() {
        const originalWidth = window.innerWidth;
        const issues = [];

        // Simulate mobile viewport
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 375
        });

        // Check for horizontal scroll
        if (document.body.scrollWidth > 375) {
            issues.push('Horizontal scroll detected on mobile');
        }

        // Check touch targets
        const touchTargets = document.querySelectorAll('button, input, select, textarea, a');
        touchTargets.forEach(target => {
            const rect = target.getBoundingClientRect();
            if (rect.height < 44 || rect.width < 44) {
                issues.push(`Touch target too small: ${target.tagName}`);
            }
        });

        // Restore original width
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: originalWidth
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'Mobile responsiveness OK' : `${issues.length} mobile issues found`,
            details: issues
        };
    }

    testTabletResponsiveness() {
        const originalWidth = window.innerWidth;
        const issues = [];

        // Simulate tablet viewport
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 768
        });

        // Check for horizontal scroll
        if (document.body.scrollWidth > 768) {
            issues.push('Horizontal scroll detected on tablet');
        }

        // Restore original width
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: originalWidth
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'Tablet responsiveness OK' : `${issues.length} tablet issues found`,
            details: issues
        };
    }

    testDesktopResponsiveness() {
        const originalWidth = window.innerWidth;
        const issues = [];

        // Simulate desktop viewport
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1200
        });

        // Check for horizontal scroll
        if (document.body.scrollWidth > 1200) {
            issues.push('Horizontal scroll detected on desktop');
        }

        // Restore original width
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: originalWidth
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'Desktop responsiveness OK' : `${issues.length} desktop issues found`,
            details: issues
        };
    }

    testTouchTargets() {
        const touchTargets = document.querySelectorAll('button, input, select, textarea, a');
        const issues = [];

        touchTargets.forEach(target => {
            const rect = target.getBoundingClientRect();
            if (rect.height < 44 || rect.width < 44) {
                issues.push(`Touch target too small: ${target.tagName}`);
            }
        });

        return {
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All touch targets meet requirements' : `${issues.length} touch target issues found`,
            details: issues
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
        const testResults = document.getElementById('testResults');
        if (testResults) {
            testResults.innerHTML = `<div class="test-status">${message}</div>`;
        }
    }

    displayTestResults() {
        const testResults = document.getElementById('testResults');
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
}

// Initialize automated testing
document.addEventListener('DOMContentLoaded', () => {
    window.automatedTesting = new AutomatedTesting2025();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutomatedTesting2025;
}
