/**
 * Design Tokens Validation 2025 - JavaScript
 * Validation system for design tokens and consistency
 */

class DesignTokensValidation2025 {
    constructor() {
        this.validationResults = [];
        this.tokenRules = this.getTokenRules();
        this.init();
    }

    init() {
        this.setupValidationUI();
        this.bindValidationEvents();
    }

    setupValidationUI() {
        const validationUI = document.createElement('div');
        validationUI.className = 'design-tokens-validation';
        validationUI.innerHTML = `
            <div class="validation-header">
                <h3>Design Tokens Validation</h3>
                <div class="validation-controls">
                    <button class="btn btn-primary" id="validateAllTokens">Validate All Tokens</button>
                    <button class="btn btn-secondary" id="validateColorTokens">Color Tokens</button>
                    <button class="btn btn-secondary" id="validateSpacingTokens">Spacing Tokens</button>
                    <button class="btn btn-secondary" id="validateTypographyTokens">Typography Tokens</button>
                </div>
            </div>
            <div class="validation-results" id="tokenValidationResults"></div>
        `;
        
        document.body.appendChild(validationUI);
    }

    bindValidationEvents() {
        document.getElementById('validateAllTokens').addEventListener('click', () => {
            this.validateAllTokens();
        });

        document.getElementById('validateColorTokens').addEventListener('click', () => {
            this.validateColorTokens();
        });

        document.getElementById('validateSpacingTokens').addEventListener('click', () => {
            this.validateSpacingTokens();
        });

        document.getElementById('validateTypographyTokens').addEventListener('click', () => {
            this.validateTypographyTokens();
        });
    }

    getTokenRules() {
        return {
            colors: {
                required: ['primary', 'secondary', 'success', 'warning', 'danger', 'info'],
                formats: ['hex', 'rgb', 'hsl'],
                contrast: { min: 4.5, max: 21 }
            },
            spacing: {
                scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64],
                unit: 'rem'
            },
            typography: {
                scales: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'],
                weights: [300, 400, 500, 600, 700],
                lineHeights: [1, 1.25, 1.5, 1.75, 2]
            }
        };
    }

    async validateAllTokens() {
        this.validationResults = [];
        this.updateValidationUI('Validating all design tokens...');

        await this.validateColorTokens();
        await this.validateSpacingTokens();
        await this.validateTypographyTokens();
        await this.validateConsistency();

        this.displayValidationResults();
    }

    async validateColorTokens() {
        const issues = [];
        
        // Check if color tokens are loaded
        const colorStyles = document.querySelectorAll('link[href*="design-tokens"]');
        if (colorStyles.length === 0) {
            issues.push('Design tokens CSS not loaded');
        }

        // Check for required color tokens
        const requiredColors = this.tokenRules.colors.required;
        requiredColors.forEach(color => {
            const testElement = document.createElement('div');
            testElement.style.setProperty('--color-' + color, 'var(--color-' + color + ')');
            const computedValue = getComputedStyle(testElement).getPropertyValue('--color-' + color);
            
            if (!computedValue || computedValue === 'var(--color-' + color + ')') {
                issues.push(`Missing color token: --color-${color}`);
            }
        });

        // Check color format consistency
        const colorElements = document.querySelectorAll('[style*="color:"]');
        colorElements.forEach(element => {
            const color = element.style.color;
            if (color && !this.isValidColorFormat(color)) {
                issues.push(`Invalid color format: ${color}`);
            }
        });

        this.validationResults.push({
            category: 'colors',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All color tokens valid' : `${issues.length} color issues found`,
            details: issues
        });
    }

    async validateSpacingTokens() {
        const issues = [];
        
        // Check spacing scale consistency
        const spacingElements = document.querySelectorAll('[class*="space-"], [class*="p-"], [class*="m-"]');
        spacingElements.forEach(element => {
            const classes = element.className.split(' ');
            classes.forEach(cls => {
                if (cls.match(/^(space-|p-|m-)/)) {
                    const value = cls.split('-')[1];
                    if (!this.tokenRules.spacing.scale.includes(parseInt(value))) {
                        issues.push(`Invalid spacing value: ${value}`);
                    }
                }
            });
        });

        this.validationResults.push({
            category: 'spacing',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All spacing tokens valid' : `${issues.length} spacing issues found`,
            details: issues
        });
    }

    async validateTypographyTokens() {
        const issues = [];
        
        // Check typography scale consistency
        const textElements = document.querySelectorAll('[class*="text-"]');
        textElements.forEach(element => {
            const classes = element.className.split(' ');
            classes.forEach(cls => {
                if (cls.match(/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)$/)) {
                    const size = cls.split('-')[1];
                    if (!this.tokenRules.typography.scales.includes(size)) {
                        issues.push(`Invalid text size: ${size}`);
                    }
                }
            });
        });

        this.validationResults.push({
            category: 'typography',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'All typography tokens valid' : `${issues.length} typography issues found`,
            details: issues
        });
    }

    async validateConsistency() {
        const issues = [];
        
        // Check for consistent usage patterns
        const buttons = document.querySelectorAll('.btn');
        const buttonVariants = new Set();
        
        buttons.forEach(button => {
            buttonVariants.add(button.className);
        });

        if (buttonVariants.size > 10) {
            issues.push('Too many button variants - consider consolidating');
        }

        // Check for consistent spacing
        const cards = document.querySelectorAll('.card');
        const cardPaddings = new Set();
        
        cards.forEach(card => {
            const padding = getComputedStyle(card).padding;
            cardPaddings.add(padding);
        });

        if (cardPaddings.size > 5) {
            issues.push('Inconsistent card padding - standardize spacing');
        }

        this.validationResults.push({
            category: 'consistency',
            status: issues.length === 0 ? 'pass' : 'fail',
            message: issues.length === 0 ? 'Design system is consistent' : `${issues.length} consistency issues found`,
            details: issues
        });
    }

    isValidColorFormat(color) {
        const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
        const hslPattern = /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/;
        
        return hexPattern.test(color) || rgbPattern.test(color) || hslPattern.test(color);
    }

    updateValidationUI(message) {
        const results = document.getElementById('tokenValidationResults');
        if (results) {
            results.innerHTML = `<div class="validation-status">${message}</div>`;
        }
    }

    displayValidationResults() {
        const results = document.getElementById('tokenValidationResults');
        if (!results) return;

        const passed = this.validationResults.filter(r => r.status === 'pass').length;
        const failed = this.validationResults.filter(r => r.status === 'fail').length;

        let html = `
            <div class="validation-summary">
                <h4>Validation Results</h4>
                <div class="validation-stats">
                    <span class="validation-stat passed">Passed: ${passed}</span>
                    <span class="validation-stat failed">Failed: ${failed}</span>
                </div>
            </div>
            <div class="validation-details">
        `;

        this.validationResults.forEach(result => {
            const statusClass = result.status;
            html += `
                <div class="validation-result ${statusClass}">
                    <div class="validation-header">
                        <span class="validation-category">${result.category}</span>
                        <span class="validation-status">${result.status.toUpperCase()}</span>
                    </div>
                    <div class="validation-message">${result.message}</div>
                    ${result.details.length > 0 ? `
                        <div class="validation-details">
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
    getValidationResults() {
        return this.validationResults;
    }

    exportResults() {
        const dataStr = JSON.stringify(this.validationResults, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `design-tokens-validation-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

// Initialize design tokens validation
document.addEventListener('DOMContentLoaded', () => {
    window.designTokensValidation = new DesignTokensValidation2025();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DesignTokensValidation2025;
}
