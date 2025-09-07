/**
 * Angkor Compliance Platform - Print JavaScript 2025
 * 
 * Print functionality and print-optimized features.
 */

class PrintManager {
    constructor() {
        this.printStyles = null;
        this.init();
    }

    init() {
        this.setupPrintStyles();
        this.setupPrintEvents();
    }

    setupPrintStyles() {
        // Add print stylesheet if not already present
        if (!document.querySelector('link[href*="print-2025.css"]')) {
            const printLink = document.createElement('link');
            printLink.rel = 'stylesheet';
            printLink.href = 'assets/css/print-2025.css';
            printLink.media = 'print';
            document.head.appendChild(printLink);
        }
    }

    setupPrintEvents() {
        // Print button functionality
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-print]')) {
                e.preventDefault();
                this.printPage();
            }
        });

        // Print keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                this.printPage();
            }
        });
    }

    printPage() {
        // Add print class to body
        document.body.classList.add('printing');
        
        // Trigger print dialog
        window.print();
        
        // Remove print class after print
        setTimeout(() => {
            document.body.classList.remove('printing');
        }, 1000);
    }

    // Print specific sections
    printSection(selector) {
        const element = document.querySelector(selector);
        if (element) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print - ${document.title}</title>
                        <link rel="stylesheet" href="assets/css/print-2025.css" media="print">
                    </head>
                    <body>
                        ${element.outerHTML}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    }

    // Print with custom options
    printWithOptions(options = {}) {
        const {
            title = document.title,
            styles = [],
            content = document.body.innerHTML,
            pageSize = 'A4',
            orientation = 'portrait'
        } = options;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${title}</title>
                    <link rel="stylesheet" href="assets/css/print-2025.css" media="print">
                    ${styles.map(style => `<style>${style}</style>`).join('')}
                </head>
                <body class="print-${pageSize.toLowerCase()} print-${orientation}">
                    ${content}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}

// Initialize print manager
document.addEventListener('DOMContentLoaded', () => {
    window.printManager = new PrintManager();
});

// Global access
window.PrintManager = PrintManager;
