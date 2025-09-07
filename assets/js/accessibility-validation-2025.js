/**
 * Angkor Compliance Platform - Accessibility Validation JavaScript 2025
 * 
 * WCAG 2.1 AA compliance validation, accessibility testing,
 * and accessibility enhancement functionality.
 */

class AccessibilityValidator {
    constructor() {
        this.testResults = {
            errors: [],
            warnings: [],
            successes: [],
            info: []
        };
        this.testMode = false;
        this.init();
    }

    init() {
        this.setupTestControls();
        this.setupTestOverlay();
        this.setupTestResults();
        this.setupTestSummary();
        this.setupTestExport();
    }

    setupTestControls() {
        const controls = document.createElement('div');
        controls.className = 'a11y-test-controls';
        controls.innerHTML = `
            <h4>Accessibility Testing</h4>
            <button onclick="accessibilityValidator.runFullTest()">Run Full Test</button>
            <button onclick="accessibilityValidator.runColorContrastTest()">Color Contrast</button>
            <button onclick="accessibilityValidator.runFocusTest()">Focus Test</button>
            <button onclick="accessibilityValidator.runKeyboardTest()">Keyboard Test</button>
            <button onclick="accessibilityValidator.runAriaTest()">ARIA Test</button>
            <button onclick="accessibilityValidator.runScreenReaderTest()">Screen Reader</button>
            <button onclick="accessibilityValidator.runTouchTargetTest()">Touch Targets</button>
            <button onclick="accessibilityValidator.runMotionTest()">Motion Test</button>
            <button onclick="accessibilityValidator.runLanguageTest()">Language Test</button>
            <button onclick="accessibilityValidator.runHeadingTest()">Heading Test</button>
            <button onclick="accessibilityValidator.runLinkTest()">Link Test</button>
            <button onclick="accessibilityValidator.runFormTest()">Form Test</button>
            <button onclick="accessibilityValidator.runImageTest()">Image Test</button>
            <button onclick="accessibilityValidator.runTableTest()">Table Test</button>
            <button onclick="accessibilityValidator.clearResults()">Clear Results</button>
        `;
        document.body.appendChild(controls);
    }

    setupTestOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'a11y-test-overlay';
        document.body.appendChild(overlay);
    }

    setupTestResults() {
        const results = document.createElement('div');
        results.className = 'a11y-test-results';
        results.innerHTML = `
            <h3>Accessibility Test Results</h3>
            <div class="test-results-content"></div>
        `;
        document.body.appendChild(results);
    }

    setupTestSummary() {
        const summary = document.createElement('div');
        summary.className = 'a11y-test-summary';
        summary.innerHTML = `
            <h4>Test Summary</h4>
            <div class="summary-content"></div>
        `;
        document.body.appendChild(summary);
    }

    setupTestExport() {
        const exportControls = document.createElement('div');
        exportControls.className = 'a11y-test-export';
        exportControls.innerHTML = `
            <h4>Export Results</h4>
            <button onclick="accessibilityValidator.exportResults('json')">Export JSON</button>
            <button onclick="accessibilityValidator.exportResults('csv')">Export CSV</button>
            <button onclick="accessibilityValidator.exportResults('html')">Export HTML</button>
            <button onclick="accessibilityValidator.exportResults('pdf')">Export PDF</button>
        `;
        document.body.appendChild(exportControls);
    }

    // Test Methods
    runFullTest() {
        this.clearResults();
        this.runColorContrastTest();
        this.runFocusTest();
        this.runKeyboardTest();
        this.runAriaTest();
        this.runScreenReaderTest();
        this.runTouchTargetTest();
        this.runMotionTest();
        this.runLanguageTest();
        this.runHeadingTest();
        this.runLinkTest();
        this.runFormTest();
        this.runImageTest();
        this.runTableTest();
        this.updateResults();
        this.updateSummary();
    }

    runColorContrastTest() {
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
            const styles = window.getComputedStyle(element);
            const color = styles.color;
            const backgroundColor = styles.backgroundColor;
            
            if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
                const contrast = this.calculateContrast(color, backgroundColor);
                const ratio = contrast.ratio;
                const level = contrast.level;
                
                element.classList.add('color-contrast-test');
                element.setAttribute('data-contrast-ratio', `${ratio.toFixed(2)}:1 (${level})`);
                
                if (level === 'AAA') {
                    this.addResult('success', 'Color Contrast', `Excellent contrast ratio: ${ratio.toFixed(2)}:1`, element);
                    element.classList.add('contrast-pass');
                } else if (level === 'AA') {
                    this.addResult('success', 'Color Contrast', `Good contrast ratio: ${ratio.toFixed(2)}:1`, element);
                    element.classList.add('contrast-pass');
                } else if (level === 'AA Large') {
                    this.addResult('warning', 'Color Contrast', `Acceptable contrast ratio for large text: ${ratio.toFixed(2)}:1`, element);
                    element.classList.add('contrast-warning');
                } else {
                    this.addResult('error', 'Color Contrast', `Poor contrast ratio: ${ratio.toFixed(2)}:1`, element);
                    element.classList.add('contrast-fail');
                }
            }
        });
    }

    runFocusTest() {
        const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        focusableElements.forEach((element, index) => {
            element.classList.add('focus-test');
            element.classList.add('keyboard-nav-test');
            element.setAttribute('data-tab-order', index + 1);
            
            if (element.hasAttribute('tabindex') && element.getAttribute('tabindex') !== '-1') {
                this.addResult('success', 'Focus Management', 'Element is focusable', element);
                element.classList.add('focus-visible-test');
            } else {
                this.addResult('warning', 'Focus Management', 'Element may not be focusable', element);
            }
        });
    }

    runKeyboardTest() {
        const interactiveElements = document.querySelectorAll('button, [href], input, select, textarea, [role="button"], [role="link"]');
        interactiveElements.forEach(element => {
            if (!element.hasAttribute('tabindex') || element.getAttribute('tabindex') !== '-1') {
                this.addResult('success', 'Keyboard Navigation', 'Element is keyboard accessible', element);
            } else {
                this.addResult('error', 'Keyboard Navigation', 'Element is not keyboard accessible', element);
            }
        });
    }

    runAriaTest() {
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
            const ariaAttributes = [];
            const attributes = element.attributes;
            
            for (let i = 0; i < attributes.length; i++) {
                const attr = attributes[i];
                if (attr.name.startsWith('aria-')) {
                    ariaAttributes.push(attr.name);
                }
            }
            
            if (ariaAttributes.length > 0) {
                element.classList.add('aria-test');
                element.setAttribute('data-aria-attributes', ariaAttributes.join(', '));
                this.addResult('success', 'ARIA', `Element has ARIA attributes: ${ariaAttributes.join(', ')}`, element);
                element.classList.add('aria-valid');
            } else if (element.hasAttribute('role')) {
                this.addResult('warning', 'ARIA', 'Element has role but no ARIA attributes', element);
                element.classList.add('aria-missing');
            }
        });
    }

    runScreenReaderTest() {
        const elements = document.querySelectorAll('img, button, [role="button"], [role="link"]');
        elements.forEach(element => {
            let srContent = '';
            
            if (element.tagName === 'IMG') {
                srContent = element.getAttribute('alt') || 'No alt text';
                if (!element.getAttribute('alt')) {
                    this.addResult('error', 'Screen Reader', 'Image missing alt text', element);
                    element.classList.add('sr-invalid');
                } else {
                    this.addResult('success', 'Screen Reader', 'Image has alt text', element);
                    element.classList.add('sr-valid');
                }
            } else if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
                srContent = element.textContent.trim() || element.getAttribute('aria-label') || 'No accessible name';
                if (!element.textContent.trim() && !element.getAttribute('aria-label')) {
                    this.addResult('error', 'Screen Reader', 'Button missing accessible name', element);
                    element.classList.add('sr-invalid');
                } else {
                    this.addResult('success', 'Screen Reader', 'Button has accessible name', element);
                    element.classList.add('sr-valid');
                }
            }
            
            if (srContent) {
                element.classList.add('sr-test');
                element.setAttribute('data-sr-content', srContent);
            }
        });
    }

    runTouchTargetTest() {
        const interactiveElements = document.querySelectorAll('button, [href], input, select, textarea, [role="button"], [role="link"]');
        interactiveElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            const size = Math.min(width, height);
            
            element.classList.add('touch-target-test');
            element.setAttribute('data-touch-size', `${width}x${height}px`);
            
            if (size >= 44) {
                this.addResult('success', 'Touch Targets', `Touch target size: ${width}x${height}px`, element);
                element.classList.add('touch-target-pass');
            } else if (size >= 36) {
                this.addResult('warning', 'Touch Targets', `Touch target size may be too small: ${width}x${height}px`, element);
                element.classList.add('touch-target-warning');
            } else {
                this.addResult('error', 'Touch Targets', `Touch target too small: ${width}x${height}px`, element);
                element.classList.add('touch-target-fail');
            }
        });
    }

    runMotionTest() {
        const animatedElements = document.querySelectorAll('*');
        animatedElements.forEach(element => {
            const styles = window.getComputedStyle(element);
            const animation = styles.animation;
            const transition = styles.transition;
            
            if (animation !== 'none' || transition !== 'all 0s ease 0s') {
                element.classList.add('motion-test');
                element.setAttribute('data-motion-type', animation !== 'none' ? 'animation' : 'transition');
                
                if (element.style.animationDuration && parseFloat(element.style.animationDuration) > 3) {
                    this.addResult('warning', 'Motion', 'Animation duration may be too long', element);
                    element.classList.add('motion-warning');
                } else {
                    this.addResult('success', 'Motion', 'Motion is appropriate', element);
                    element.classList.add('motion-safe');
                }
            }
        });
    }

    runLanguageTest() {
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
            const lang = element.getAttribute('lang') || element.closest('[lang]')?.getAttribute('lang');
            
            if (lang) {
                element.classList.add('language-test');
                element.setAttribute('data-language', lang);
                this.addResult('success', 'Language', `Element has language: ${lang}`, element);
                element.classList.add('language-valid');
            } else if (element.tagName === 'HTML') {
                this.addResult('error', 'Language', 'HTML element missing lang attribute', element);
                element.classList.add('language-invalid');
            }
        });
    }

    runHeadingTest() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let previousLevel = 0;
        
        headings.forEach(heading => {
            const level = parseInt(heading.tagName.charAt(1));
            heading.classList.add('heading-test');
            heading.setAttribute('data-heading-level', level);
            
            if (level === previousLevel + 1 || level === 1) {
                this.addResult('success', 'Headings', `Proper heading hierarchy: H${level}`, heading);
                heading.classList.add('heading-valid');
            } else if (level > previousLevel + 1) {
                this.addResult('error', 'Headings', `Skipped heading level: H${level}`, heading);
                heading.classList.add('heading-skip');
            } else {
                this.addResult('warning', 'Headings', `Heading level: H${level}`, heading);
                heading.classList.add('heading-valid');
            }
            
            previousLevel = level;
        });
    }

    runLinkTest() {
        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
            const text = link.textContent.trim();
            const href = link.getAttribute('href');
            
            link.classList.add('link-test');
            link.setAttribute('data-link-text', text || 'No text');
            
            if (!text) {
                this.addResult('error', 'Links', 'Link missing text content', link);
                link.classList.add('link-invalid');
            } else if (text.length < 3) {
                this.addResult('warning', 'Links', 'Link text may be too short', link);
                link.classList.add('link-invalid');
            } else {
                this.addResult('success', 'Links', 'Link has appropriate text', link);
                link.classList.add('link-valid');
            }
            
            if (href === '#' || href === 'javascript:void(0)') {
                this.addResult('warning', 'Links', 'Link has placeholder href', link);
            }
        });
    }

    runFormTest() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, select, textarea');
            const labels = form.querySelectorAll('label');
            
            form.classList.add('form-test');
            form.setAttribute('data-form-status', `${inputs.length} inputs, ${labels.length} labels`);
            
            inputs.forEach(input => {
                const id = input.getAttribute('id');
                const label = form.querySelector(`label[for="${id}"]`);
                
                if (!label && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
                    this.addResult('error', 'Forms', 'Input missing label', input);
                    input.classList.add('form-invalid');
                } else {
                    this.addResult('success', 'Forms', 'Input has label', input);
                    input.classList.add('form-valid');
                }
            });
        });
    }

    runImageTest() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            const alt = img.getAttribute('alt');
            const src = img.getAttribute('src');
            
            img.classList.add('image-test');
            img.setAttribute('data-image-status', alt ? 'Has alt' : 'No alt');
            
            if (!alt) {
                this.addResult('error', 'Images', 'Image missing alt text', img);
                img.classList.add('image-invalid');
            } else if (alt.length < 3) {
                this.addResult('warning', 'Images', 'Image alt text may be too short', img);
                img.classList.add('image-invalid');
            } else {
                this.addResult('success', 'Images', 'Image has alt text', img);
                img.classList.add('image-valid');
            }
        });
    }

    runTableTest() {
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            const headers = table.querySelectorAll('th');
            const rows = table.querySelectorAll('tr');
            
            table.classList.add('table-test');
            table.setAttribute('data-table-status', `${headers.length} headers, ${rows.length} rows`);
            
            if (headers.length === 0) {
                this.addResult('error', 'Tables', 'Table missing headers', table);
                table.classList.add('table-invalid');
            } else {
                this.addResult('success', 'Tables', 'Table has headers', table);
                table.classList.add('table-valid');
            }
            
            headers.forEach(header => {
                if (!header.getAttribute('scope') && !header.getAttribute('id')) {
                    this.addResult('warning', 'Tables', 'Header missing scope or id', header);
                }
            });
        });
    }

    // Utility Methods
    calculateContrast(color1, color2) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        const lum1 = this.getLuminance(rgb1);
        const lum2 = this.getLuminance(rgb2);
        
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        
        const ratio = (brightest + 0.05) / (darkest + 0.05);
        
        let level = 'Fail';
        if (ratio >= 7) level = 'AAA';
        else if (ratio >= 4.5) level = 'AA';
        else if (ratio >= 3) level = 'AA Large';
        
        return { ratio, level };
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    getLuminance(rgb) {
        const { r, g, b } = rgb;
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    addResult(type, category, message, element) {
        this.testResults[type].push({
            category,
            message,
            element,
            timestamp: new Date().toISOString()
        });
    }

    updateResults() {
        const resultsContent = document.querySelector('.test-results-content');
        resultsContent.innerHTML = '';
        
        Object.keys(this.testResults).forEach(type => {
            const results = this.testResults[type];
            results.forEach(result => {
                const item = document.createElement('div');
                item.className = `a11y-test-item ${type}`;
                item.innerHTML = `
                    <strong>${result.category}:</strong> ${result.message}
                    <br><small>Element: ${result.element.tagName.toLowerCase()}</small>
                `;
                resultsContent.appendChild(item);
            });
        });
    }

    updateSummary() {
        const summaryContent = document.querySelector('.summary-content');
        const total = Object.values(this.testResults).reduce((sum, arr) => sum + arr.length, 0);
        
        summaryContent.innerHTML = `
            <div class="summary-item">
                <span class="summary-label">Total Tests:</span>
                <span class="summary-value">${total}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Errors:</span>
                <span class="summary-value error">${this.testResults.errors.length}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Warnings:</span>
                <span class="summary-value warning">${this.testResults.warnings.length}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Successes:</span>
                <span class="summary-value success">${this.testResults.successes.length}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Info:</span>
                <span class="summary-value">${this.testResults.info.length}</span>
            </div>
        `;
    }

    clearResults() {
        this.testResults = {
            errors: [],
            warnings: [],
            successes: [],
            info: []
        };
        
        // Remove test classes
        document.querySelectorAll('.color-contrast-test, .focus-test, .keyboard-nav-test, .aria-test, .sr-test, .touch-target-test, .motion-test, .language-test, .heading-test, .link-test, .form-test, .image-test, .table-test').forEach(el => {
            el.classList.remove('color-contrast-test', 'focus-test', 'keyboard-nav-test', 'aria-test', 'sr-test', 'touch-target-test', 'motion-test', 'language-test', 'heading-test', 'link-test', 'form-test', 'image-test', 'table-test');
            el.removeAttribute('data-contrast-ratio');
            el.removeAttribute('data-tab-order');
            el.removeAttribute('data-aria-attributes');
            el.removeAttribute('data-sr-content');
            el.removeAttribute('data-touch-size');
            el.removeAttribute('data-motion-type');
            el.removeAttribute('data-language');
            el.removeAttribute('data-heading-level');
            el.removeAttribute('data-link-text');
            el.removeAttribute('data-form-status');
            el.removeAttribute('data-image-status');
            el.removeAttribute('data-table-status');
        });
        
        this.updateResults();
        this.updateSummary();
    }

    exportResults(format) {
        const data = {
            timestamp: new Date().toISOString(),
            results: this.testResults,
            summary: {
                total: Object.values(this.testResults).reduce((sum, arr) => sum + arr.length, 0),
                errors: this.testResults.errors.length,
                warnings: this.testResults.warnings.length,
                successes: this.testResults.successes.length,
                info: this.testResults.info.length
            }
        };
        
        switch (format) {
            case 'json':
                this.downloadFile(JSON.stringify(data, null, 2), 'accessibility-test-results.json', 'application/json');
                break;
            case 'csv':
                this.downloadFile(this.convertToCSV(data), 'accessibility-test-results.csv', 'text/csv');
                break;
            case 'html':
                this.downloadFile(this.convertToHTML(data), 'accessibility-test-results.html', 'text/html');
                break;
            case 'pdf':
                this.downloadFile(this.convertToPDF(data), 'accessibility-test-results.pdf', 'application/pdf');
                break;
        }
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    convertToCSV(data) {
        let csv = 'Type,Category,Message,Element,Timestamp\n';
        Object.keys(data.results).forEach(type => {
            data.results[type].forEach(result => {
                csv += `"${type}","${result.category}","${result.message}","${result.element.tagName.toLowerCase()}","${result.timestamp}"\n`;
            });
        });
        return csv;
    }

    convertToHTML(data) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Accessibility Test Results</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .error { color: #e53e3e; }
                    .warning { color: #f6ad55; }
                    .success { color: #38a169; }
                    .info { color: #3182ce; }
                </style>
            </head>
            <body>
                <h1>Accessibility Test Results</h1>
                <p>Generated: ${data.timestamp}</p>
                <h2>Summary</h2>
                <ul>
                    <li>Total Tests: ${data.summary.total}</li>
                    <li>Errors: ${data.summary.errors}</li>
                    <li>Warnings: ${data.summary.warnings}</li>
                    <li>Successes: ${data.summary.successes}</li>
                    <li>Info: ${data.summary.info}</li>
                </ul>
                <h2>Results</h2>
                ${Object.keys(data.results).map(type => `
                    <h3 class="${type}">${type.toUpperCase()}</h3>
                    <ul>
                        ${data.results[type].map(result => `
                            <li><strong>${result.category}:</strong> ${result.message} (${result.element.tagName.toLowerCase()})</li>
                        `).join('')}
                    </ul>
                `).join('')}
            </body>
            </html>
        `;
    }

    convertToPDF(data) {
        // Simple PDF generation (would need a proper PDF library in production)
        return this.convertToHTML(data);
    }
}

// Initialize accessibility validator
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityValidator = new AccessibilityValidator();
});

// Global access
window.AccessibilityValidator = AccessibilityValidator;
