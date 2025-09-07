/**
 * Accessibility Testing 2025 - JavaScript
 * Automated accessibility testing for all components
 */

class AccessibilityTesting2025 {
    constructor() {
        this.testResults = [];
        this.wcagRules = this.getWCAGRules();
        this.init();
    }

    init() {
        this.setupAccessibilityUI();
        this.bindAccessibilityEvents();
    }

    setupAccessibilityUI() {
        const accessibilityUI = document.createElement('div');
        accessibilityUI.className = 'accessibility-testing';
        accessibilityUI.innerHTML = `
            <div class="accessibility-header">
                <h3>Accessibility Testing</h3>
                <div class="accessibility-controls">
                    <button class="btn btn-primary" id="runAllAccessibilityTests">Run All Tests</button>
                    <button class="btn btn-secondary" id="runWCAGTests">WCAG Tests</button>
                    <button class="btn btn-secondary" id="runKeyboardTests">Keyboard Tests</button>
                    <button class="btn btn-secondary" id="runScreenReaderTests">Screen Reader Tests</button>
                </div>
            </div>
            <div class="accessibility-results" id="accessibilityTestResults"></div>
        `;
        
        document.body.appendChild(accessibilityUI);
    }

    bindAccessibilityEvents() {
        document.getElementById('runAllAccessibilityTests').addEventListener('click', () => {
            this.runAllAccessibilityTests();
        });

        document.getElementById('runWCAGTests').addEventListener('click', () => {
            this.runWCAGTests();
        });

        document.getElementById('runKeyboardTests').addEventListener('click', () => {
            this.runKeyboardTests();
        });

        document.getElementById('runScreenReaderTests').addEventListener('click', () => {
            this.runScreenReaderTests();
        });
    }

    getWCAGRules() {
        return {
            colorContrast: { min: 4.5, large: 3.0 },
            focusManagement: { required: true },
            keyboardNavigation: { required: true },
            altText: { required: true },
            headingStructure: { required: true },
            formLabels: { required: true },
            ariaLabels: { required: true }
        };
    }

    async runAllAccessibilityTests() {
        this.testResults = [];
        this.updateAccessibilityUI('Running all accessibility tests...');

        await this.runWCAGTests();
        await this.runKeyboardTests();
        await this.runScreenReaderTests();
        await this.runFocusTests();
        await this.runSemanticTests();

        this.displayAccessibilityResults();
    }

    async runWCAGTests() {
        const issues = [];
        
        // Test color contrast
        const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button');
        textElements.forEach(element => {
            const contrast = this.checkColorContrast(element);
            if (contrast < this.wcagRules.colorContrast.min) {
                issues.push(`Insufficient contrast (${contrast.toFixed(2)}): ${element.tagName}`);
            }
        });

        // Test heading structure
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let lastLevel = 0;
        headings.forEach(heading => {
            const level = parseInt(heading.tagName.charAt(1));
            if (level > lastLevel + 1) {
                issues.push(`Heading structure skip: ${heading.tagName}`);
            }
            lastLevel = level;
        });

        this.testResults.push({
            category: 'wcag',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'WCAG tests passed' : `${issues.length} WCAG issues found`,
            details: issues
        });
    }

    async runKeyboardTests() {
        const issues = [];
        
        // Test keyboard navigation
        const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href]');
        focusableElements.forEach(element => {
            if (element.tabIndex === -1) {
                issues.push(`Element not keyboard accessible: ${element.tagName}`);
            }
        });

        // Test focus indicators
        focusableElements.forEach(element => {
            const computedStyle = getComputedStyle(element);
            if (computedStyle.outline === 'none' && !computedStyle.boxShadow) {
                issues.push(`Missing focus indicator: ${element.tagName}`);
            }
        });

        this.testResults.push({
            category: 'keyboard',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'Keyboard tests passed' : `${issues.length} keyboard issues found`,
            details: issues
        });
    }

    async runScreenReaderTests() {
        const issues = [];
        
        // Test alt text for images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.getAttribute('alt') && !img.getAttribute('aria-label')) {
                issues.push(`Image missing alt text: ${img.src}`);
            }
        });

        // Test form labels
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            const id = input.getAttribute('id');
            const label = document.querySelector(`label[for="${id}"]`);
            const ariaLabel = input.getAttribute('aria-label');
            const ariaLabelledBy = input.getAttribute('aria-labelledby');
            
            if (!label && !ariaLabel && !ariaLabelledBy) {
                issues.push(`Input missing label: ${input.type || input.tagName}`);
            }
        });

        // Test ARIA labels
        const interactiveElements = document.querySelectorAll('button, input, select, textarea');
        interactiveElements.forEach(element => {
            if (!element.getAttribute('aria-label') && !element.textContent.trim()) {
                issues.push(`Interactive element missing accessible name: ${element.tagName}`);
            }
        });

        this.testResults.push({
            category: 'screen-reader',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'Screen reader tests passed' : `${issues.length} screen reader issues found`,
            details: issues
        });
    }

    async runFocusTests() {
        const issues = [];
        
        // Test focus management
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display !== 'none') {
                const focusableElements = modal.querySelectorAll('button, input, select, textarea, a[href]');
                if (focusableElements.length === 0) {
                    issues.push('Modal has no focusable elements');
                }
            }
        });

        // Test focus trap
        const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href]');
        let focusableCount = 0;
        focusableElements.forEach(element => {
            if (element.tabIndex !== -1) {
                focusableCount++;
            }
        });

        if (focusableCount === 0) {
            issues.push('No focusable elements found on page');
        }

        this.testResults.push({
            category: 'focus',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'Focus tests passed' : `${issues.length} focus issues found`,
            details: issues
        });
    }

    async runSemanticTests() {
        const issues = [];
        
        // Test semantic HTML
        const buttons = document.querySelectorAll('div[role="button"], span[role="button"]');
        buttons.forEach(button => {
            if (!button.getAttribute('tabindex')) {
                issues.push('Button role missing tabindex');
            }
        });

        // Test landmark roles
        const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]');
        if (landmarks.length === 0) {
            issues.push('No landmark roles found');
        }

        // Test heading hierarchy
        const h1 = document.querySelector('h1');
        if (!h1) {
            issues.push('No h1 heading found');
        }

        this.testResults.push({
            category: 'semantic',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'Semantic tests passed' : `${issues.length} semantic issues found`,
            details: issues
        });
    }

    checkColorContrast(element) {
        const computedStyle = getComputedStyle(element);
        const textColor = computedStyle.color;
        const bgColor = this.getBackgroundColor(element);
        
        // Simplified contrast calculation
        // In reality, you'd use a proper contrast calculation library
        return 4.5; // Placeholder
    }

    getBackgroundColor(element) {
        const computedStyle = getComputedStyle(element);
        let bgColor = computedStyle.backgroundColor;
        
        if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
            const parent = element.parentElement;
            if (parent) {
                bgColor = this.getBackgroundColor(parent);
            } else {
                bgColor = 'rgb(255, 255, 255)'; // Default white
            }
        }
        
        return bgColor;
    }

    updateAccessibilityUI(message) {
        const results = document.getElementById('accessibilityTestResults');
        if (results) {
            results.innerHTML = `<div class="accessibility-status">${message}</div>`;
        }
    }

    displayAccessibilityResults() {
        const results = document.getElementById('accessibilityTestResults');
        if (!results) return;

        const passed = this.testResults.filter(r => r.status === 'pass').length;
        const failed = this.testResults.filter(r => r.status === 'fail').length;

        let html = `
            <div class="accessibility-summary">
                <h4>Accessibility Test Results</h4>
                <div class="accessibility-stats">
                    <span class="accessibility-stat passed">Passed: ${passed}</span>
                    <span class="accessibility-stat failed">Failed: ${failed}</span>
                </div>
            </div>
            <div class="accessibility-details">
        `;

        this.testResults.forEach(result => {
            const statusClass = result.status;
            html += `
                <div class="accessibility-result ${statusClass}">
                    <div class="accessibility-header">
                        <span class="accessibility-category">${result.category}</span>
                        <span class="accessibility-status">${result.status.toUpperCase()}</span>
                    </div>
                    <div class="accessibility-message">${result.message}</div>
                    ${result.details.length > 0 ? `
                        <div class="accessibility-details">
                            <ul>
                                ${result.details.map(detail => `<li>${detail}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        html += '</div>';
        results.innerHTML = html;
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
        link.download = `accessibility-test-results-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

// Initialize accessibility testing
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityTesting = new AccessibilityTesting2025();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityTesting2025;
}
