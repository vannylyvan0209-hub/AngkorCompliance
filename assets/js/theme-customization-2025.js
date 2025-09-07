/**
 * Angkor Compliance Platform - Theme Customization JavaScript 2025
 * 
 * Advanced theme customization system for different factory requirements,
 * brand customization, and user preferences.
 */

class ThemeCustomizer {
    constructor() {
        this.currentTheme = {
            primary: '#d4af37',
            secondary: '#3b82f6',
            accent: '#10b981',
            background: '#ffffff',
            surface: '#f8fafc',
            text: '#1e293b',
            textMuted: '#64748b',
            border: '#e2e8f0',
            shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            radius: '0.5rem',
            fontFamily: 'Inter',
            fontSize: '1rem',
            lineHeight: '1.5',
            spacing: '1rem',
            transition: 'all 0.15s ease',
            animationDuration: '0.3s',
            animationEasing: 'ease-in-out',
            contrastRatio: '4.5',
            fontSizeScale: '1',
            motionReduce: false,
            highContrast: false,
            focusVisible: true,
            printColor: true,
            printBackground: false,
            printMargins: '1in',
            printOrientation: 'portrait',
            printSize: 'A4'
        };
        
        this.presets = {
            default: {
                name: 'Default',
                description: 'Standard Angkor Compliance theme',
                primary: '#d4af37',
                secondary: '#3b82f6',
                accent: '#10b981'
            },
            corporate: {
                name: 'Corporate',
                description: 'Professional corporate theme',
                primary: '#1e40af',
                secondary: '#059669',
                accent: '#dc2626'
            },
            modern: {
                name: 'Modern',
                description: 'Modern minimalist theme',
                primary: '#7c3aed',
                secondary: '#ec4899',
                accent: '#f59e0b'
            },
            accessible: {
                name: 'Accessible',
                description: 'High contrast accessible theme',
                primary: '#000000',
                secondary: '#ffffff',
                accent: '#0066cc'
            },
            dark: {
                name: 'Dark',
                description: 'Dark mode theme',
                primary: '#fbbf24',
                secondary: '#60a5fa',
                accent: '#34d399'
            },
            factory: {
                name: 'Factory',
                description: 'Factory-specific theme',
                primary: '#dc2626',
                secondary: '#f59e0b',
                accent: '#10b981'
            }
        };
        
        this.init();
    }

    init() {
        this.createCustomizer();
        this.createToggle();
        this.loadSavedTheme();
        this.setupEventListeners();
        this.applyTheme();
    }

    createCustomizer() {
        const customizer = document.createElement('div');
        customizer.className = 'theme-customizer';
        customizer.innerHTML = `
            <div class="theme-customizer-header">
                <h3 class="theme-customizer-title">Theme Customizer</h3>
                <button class="theme-customizer-close" id="themeCustomizerClose">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="theme-customizer-content">
                <div class="theme-customizer-section">
                    <h4 class="theme-customizer-section-title">Presets</h4>
                    <div class="theme-presets" id="themePresets"></div>
                </div>
                
                <div class="theme-customizer-section">
                    <h4 class="theme-customizer-section-title">Colors</h4>
                    <div class="theme-customizer-control">
                        <label class="theme-customizer-label">Primary Color</label>
                        <input type="color" class="theme-customizer-color" id="primaryColor" value="${this.currentTheme.primary}">
                    </div>
                    <div class="theme-customizer-control">
                        <label class="theme-customizer-label">Secondary Color</label>
                        <input type="color" class="theme-customizer-color" id="secondaryColor" value="${this.currentTheme.secondary}">
                    </div>
                    <div class="theme-customizer-control">
                        <label class="theme-customizer-label">Accent Color</label>
                        <input type="color" class="theme-customizer-color" id="accentColor" value="${this.currentTheme.accent}">
                    </div>
                    <div class="theme-customizer-control">
                        <label class="theme-customizer-label">Background Color</label>
                        <input type="color" class="theme-customizer-color" id="backgroundColor" value="${this.currentTheme.background}">
                    </div>
                    <div class="theme-customizer-control">
                        <label class="theme-customizer-label">Surface Color</label>
                        <input type="color" class="theme-customizer-color" id="surfaceColor" value="${this.currentTheme.surface}">
                    </div>
                </div>
                
                <div class="theme-customizer-section">
                    <h4 class="theme-customizer-section-title">Typography</h4>
                    <div class="theme-customizer-control">
                        <label class="theme-customizer-label">Font Family</label>
                        <select class="theme-customizer-select" id="fontFamily">
                            <option value="Inter">Inter</option>
                            <option value="Noto Sans Khmer">Noto Sans Khmer</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Lato">Lato</option>
                            <option value="Montserrat">Montserrat</option>
                        </select>
                    </div>
                    <div class="theme-customizer-control">
                        <label class="theme-customizer-label">Font Size Scale</label>
                        <input type="range" class="theme-customizer-range" id="fontSizeScale" min="0.8" max="1.4" step="0.1" value="${this.currentTheme.fontSizeScale}">
                        <span id="fontSizeScaleValue">${this.currentTheme.fontSizeScale}</span>
                    </div>
                </div>
                
                <div class="theme-customizer-section">
                    <h4 class="theme-customizer-section-title">Layout</h4>
                    <div class="theme-customizer-control">
                        <label class="theme-customizer-label">Border Radius</label>
                        <input type="range" class="theme-customizer-range" id="borderRadius" min="0" max="1" step="0.1" value="${this.currentTheme.radius}">
                        <span id="borderRadiusValue">${this.currentTheme.radius}</span>
                    </div>
                    <div class="theme-customizer-control">
                        <label class="theme-customizer-label">Spacing</label>
                        <input type="range" class="theme-customizer-range" id="spacing" min="0.5" max="2" step="0.1" value="${this.currentTheme.spacing}">
                        <span id="spacingValue">${this.currentTheme.spacing}</span>
                    </div>
                </div>
                
                <div class="theme-customizer-section">
                    <h4 class="theme-customizer-section-title">Animations</h4>
                    <div class="theme-customizer-control">
                        <label class="theme-customizer-label">Animation Duration</label>
                        <input type="range" class="theme-customizer-range" id="animationDuration" min="0.1" max="1" step="0.1" value="${this.currentTheme.animationDuration}">
                        <span id="animationDurationValue">${this.currentTheme.animationDuration}s</span>
                    </div>
                    <div class="theme-customizer-control">
                        <div class="theme-customizer-checkbox">
                            <input type="checkbox" id="motionReduce" ${this.currentTheme.motionReduce ? 'checked' : ''}>
                            <label for="motionReduce">Reduce Motion</label>
                        </div>
                    </div>
                </div>
                
                <div class="theme-customizer-section">
                    <h4 class="theme-customizer-section-title">Accessibility</h4>
                    <div class="theme-customizer-control">
                        <label class="theme-customizer-label">Contrast Ratio</label>
                        <input type="range" class="theme-customizer-range" id="contrastRatio" min="3" max="7" step="0.5" value="${this.currentTheme.contrastRatio}">
                        <span id="contrastRatioValue">${this.currentTheme.contrastRatio}:1</span>
                    </div>
                    <div class="theme-customizer-control">
                        <div class="theme-customizer-checkbox">
                            <input type="checkbox" id="highContrast" ${this.currentTheme.highContrast ? 'checked' : ''}>
                            <label for="highContrast">High Contrast</label>
                        </div>
                    </div>
                    <div class="theme-customizer-control">
                        <div class="theme-customizer-checkbox">
                            <input type="checkbox" id="focusVisible" ${this.currentTheme.focusVisible ? 'checked' : ''}>
                            <label for="focusVisible">Focus Visible</label>
                        </div>
                    </div>
                </div>
                
                <div class="theme-customizer-section">
                    <h4 class="theme-customizer-section-title">Actions</h4>
                    <div class="theme-export-import">
                        <button class="theme-customizer-button secondary" id="exportTheme">Export</button>
                        <button class="theme-customizer-button secondary" id="importTheme">Import</button>
                    </div>
                    <input type="file" id="themeFileInput" accept=".json" style="display: none;">
                    <button class="theme-customizer-button" id="previewTheme">Preview</button>
                    <button class="theme-customizer-button" id="resetTheme">Reset</button>
                    <button class="theme-customizer-button danger" id="clearTheme">Clear</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(customizer);
        this.customizer = customizer;
    }

    createToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'theme-customizer-toggle';
        toggle.innerHTML = '<i data-lucide="palette"></i>';
        toggle.id = 'themeCustomizerToggle';
        
        document.body.appendChild(toggle);
        this.toggle = toggle;
    }

    setupEventListeners() {
        // Toggle customizer
        this.toggle.addEventListener('click', () => {
            this.customizer.classList.toggle('open');
        });
        
        // Close customizer
        document.getElementById('themeCustomizerClose').addEventListener('click', () => {
            this.customizer.classList.remove('open');
        });
        
        // Color inputs
        document.getElementById('primaryColor').addEventListener('change', (e) => {
            this.currentTheme.primary = e.target.value;
            this.applyTheme();
        });
        
        document.getElementById('secondaryColor').addEventListener('change', (e) => {
            this.currentTheme.secondary = e.target.value;
            this.applyTheme();
        });
        
        document.getElementById('accentColor').addEventListener('change', (e) => {
            this.currentTheme.accent = e.target.value;
            this.applyTheme();
        });
        
        document.getElementById('backgroundColor').addEventListener('change', (e) => {
            this.currentTheme.background = e.target.value;
            this.applyTheme();
        });
        
        document.getElementById('surfaceColor').addEventListener('change', (e) => {
            this.currentTheme.surface = e.target.value;
            this.applyTheme();
        });
        
        // Typography
        document.getElementById('fontFamily').addEventListener('change', (e) => {
            this.currentTheme.fontFamily = e.target.value;
            this.applyTheme();
        });
        
        document.getElementById('fontSizeScale').addEventListener('input', (e) => {
            this.currentTheme.fontSizeScale = e.target.value;
            document.getElementById('fontSizeScaleValue').textContent = e.target.value;
            this.applyTheme();
        });
        
        // Layout
        document.getElementById('borderRadius').addEventListener('input', (e) => {
            this.currentTheme.radius = e.target.value + 'rem';
            document.getElementById('borderRadiusValue').textContent = e.target.value + 'rem';
            this.applyTheme();
        });
        
        document.getElementById('spacing').addEventListener('input', (e) => {
            this.currentTheme.spacing = e.target.value + 'rem';
            document.getElementById('spacingValue').textContent = e.target.value + 'rem';
            this.applyTheme();
        });
        
        // Animations
        document.getElementById('animationDuration').addEventListener('input', (e) => {
            this.currentTheme.animationDuration = e.target.value + 's';
            document.getElementById('animationDurationValue').textContent = e.target.value + 's';
            this.applyTheme();
        });
        
        document.getElementById('motionReduce').addEventListener('change', (e) => {
            this.currentTheme.motionReduce = e.target.checked;
            this.applyTheme();
        });
        
        // Accessibility
        document.getElementById('contrastRatio').addEventListener('input', (e) => {
            this.currentTheme.contrastRatio = e.target.value;
            document.getElementById('contrastRatioValue').textContent = e.target.value + ':1';
            this.applyTheme();
        });
        
        document.getElementById('highContrast').addEventListener('change', (e) => {
            this.currentTheme.highContrast = e.target.checked;
            this.applyTheme();
        });
        
        document.getElementById('focusVisible').addEventListener('change', (e) => {
            this.currentTheme.focusVisible = e.target.checked;
            this.applyTheme();
        });
        
        // Actions
        document.getElementById('exportTheme').addEventListener('click', () => {
            this.exportTheme();
        });
        
        document.getElementById('importTheme').addEventListener('click', () => {
            document.getElementById('themeFileInput').click();
        });
        
        document.getElementById('themeFileInput').addEventListener('change', (e) => {
            this.importTheme(e.target.files[0]);
        });
        
        document.getElementById('previewTheme').addEventListener('click', () => {
            this.previewTheme();
        });
        
        document.getElementById('resetTheme').addEventListener('click', () => {
            this.resetTheme();
        });
        
        document.getElementById('clearTheme').addEventListener('click', () => {
            this.clearTheme();
        });
        
        // Create presets
        this.createPresets();
    }

    createPresets() {
        const presetsContainer = document.getElementById('themePresets');
        presetsContainer.innerHTML = '';
        
        Object.keys(this.presets).forEach(key => {
            const preset = this.presets[key];
            const presetElement = document.createElement('div');
            presetElement.className = 'theme-preset';
            presetElement.innerHTML = `
                <div class="theme-preset-name">${preset.name}</div>
                <div class="theme-preset-description">${preset.description}</div>
            `;
            presetElement.addEventListener('click', () => {
                this.applyPreset(key);
            });
            presetsContainer.appendChild(presetElement);
        });
    }

    applyPreset(presetKey) {
        const preset = this.presets[presetKey];
        this.currentTheme.primary = preset.primary;
        this.currentTheme.secondary = preset.secondary;
        this.currentTheme.accent = preset.accent;
        
        // Update UI
        document.getElementById('primaryColor').value = preset.primary;
        document.getElementById('secondaryColor').value = preset.secondary;
        document.getElementById('accentColor').value = preset.accent;
        
        this.applyTheme();
        this.saveTheme();
    }

    applyTheme() {
        const root = document.documentElement;
        
        // Apply color variables
        root.style.setProperty('--custom-primary', this.currentTheme.primary);
        root.style.setProperty('--custom-secondary', this.currentTheme.secondary);
        root.style.setProperty('--custom-accent', this.currentTheme.accent);
        root.style.setProperty('--custom-background', this.currentTheme.background);
        root.style.setProperty('--custom-surface', this.currentTheme.surface);
        root.style.setProperty('--custom-text', this.currentTheme.text);
        root.style.setProperty('--custom-text-muted', this.currentTheme.textMuted);
        root.style.setProperty('--custom-border', this.currentTheme.border);
        root.style.setProperty('--custom-shadow', this.currentTheme.shadow);
        root.style.setProperty('--custom-radius', this.currentTheme.radius);
        root.style.setProperty('--custom-font-family', this.currentTheme.fontFamily);
        root.style.setProperty('--custom-font-size', this.currentTheme.fontSize);
        root.style.setProperty('--custom-line-height', this.currentTheme.lineHeight);
        root.style.setProperty('--custom-spacing', this.currentTheme.spacing);
        root.style.setProperty('--custom-transition', this.currentTheme.transition);
        root.style.setProperty('--custom-animation-duration', this.currentTheme.animationDuration);
        root.style.setProperty('--custom-animation-easing', this.currentTheme.animationEasing);
        root.style.setProperty('--custom-contrast-ratio', this.currentTheme.contrastRatio);
        root.style.setProperty('--custom-font-size-scale', this.currentTheme.fontSizeScale);
        root.style.setProperty('--custom-motion-reduce', this.currentTheme.motionReduce ? 'true' : 'false');
        root.style.setProperty('--custom-high-contrast', this.currentTheme.highContrast ? 'true' : 'false');
        root.style.setProperty('--custom-focus-visible', this.currentTheme.focusVisible ? 'true' : 'false');
        root.style.setProperty('--custom-print-color', this.currentTheme.printColor ? 'true' : 'false');
        root.style.setProperty('--custom-print-background', this.currentTheme.printBackground ? 'true' : 'false');
        root.style.setProperty('--custom-print-margins', this.currentTheme.printMargins);
        root.style.setProperty('--custom-print-orientation', this.currentTheme.printOrientation);
        root.style.setProperty('--custom-print-size', this.currentTheme.printSize);
        
        // Apply accessibility settings
        if (this.currentTheme.motionReduce) {
            root.style.setProperty('--custom-animation-duration', '0s');
            root.style.setProperty('--custom-transition', 'none');
        }
        
        if (this.currentTheme.highContrast) {
            root.style.setProperty('--custom-border-width', '2px');
            root.style.setProperty('--custom-focus-width', '3px');
        }
        
        if (this.currentTheme.focusVisible) {
            root.style.setProperty('--custom-focus-visible', 'auto');
        } else {
            root.style.setProperty('--custom-focus-visible', 'none');
        }
        
        // Apply font size scale
        const scale = parseFloat(this.currentTheme.fontSizeScale);
        root.style.setProperty('--custom-font-size-scale', scale);
        
        // Apply print settings
        if (this.currentTheme.printColor) {
            root.style.setProperty('--custom-print-color', 'true');
        } else {
            root.style.setProperty('--custom-print-color', 'false');
        }
        
        if (this.currentTheme.printBackground) {
            root.style.setProperty('--custom-print-background', 'true');
        } else {
            root.style.setProperty('--custom-print-background', 'false');
        }
    }

    previewTheme() {
        // Create preview modal
        const preview = document.createElement('div');
        preview.className = 'theme-preview show';
        preview.innerHTML = `
            <div class="theme-preview-header">
                <h3 class="theme-preview-title">Theme Preview</h3>
                <button class="theme-preview-close" id="themePreviewClose">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="theme-preview-content">
                <div class="theme-preview-demo">
                    <h3>Sample Content</h3>
                    <p>This is a preview of how your theme will look.</p>
                    <button class="btn btn-primary">Primary Button</button>
                    <button class="btn btn-secondary">Secondary Button</button>
                    <button class="btn btn-success">Success Button</button>
                </div>
                <div class="theme-preview-actions">
                    <button class="btn btn-primary" id="applyPreview">Apply Theme</button>
                    <button class="btn btn-secondary" id="cancelPreview">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(preview);
        
        // Event listeners
        document.getElementById('themePreviewClose').addEventListener('click', () => {
            preview.remove();
        });
        
        document.getElementById('applyPreview').addEventListener('click', () => {
            this.saveTheme();
            preview.remove();
        });
        
        document.getElementById('cancelPreview').addEventListener('click', () => {
            this.loadSavedTheme();
            this.applyTheme();
            preview.remove();
        });
        
        // Initialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    exportTheme() {
        const themeData = {
            name: 'Custom Theme',
            version: '1.0.0',
            theme: this.currentTheme,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'angkor-compliance-theme.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    importTheme(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const themeData = JSON.parse(e.target.result);
                if (themeData.theme) {
                    this.currentTheme = { ...this.currentTheme, ...themeData.theme };
                    this.updateUI();
                    this.applyTheme();
                    this.saveTheme();
                }
            } catch (error) {
                console.error('Error importing theme:', error);
                alert('Error importing theme. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }

    updateUI() {
        // Update color inputs
        document.getElementById('primaryColor').value = this.currentTheme.primary;
        document.getElementById('secondaryColor').value = this.currentTheme.secondary;
        document.getElementById('accentColor').value = this.currentTheme.accent;
        document.getElementById('backgroundColor').value = this.currentTheme.background;
        document.getElementById('surfaceColor').value = this.currentTheme.surface;
        
        // Update typography
        document.getElementById('fontFamily').value = this.currentTheme.fontFamily;
        document.getElementById('fontSizeScale').value = this.currentTheme.fontSizeScale;
        document.getElementById('fontSizeScaleValue').textContent = this.currentTheme.fontSizeScale;
        
        // Update layout
        document.getElementById('borderRadius').value = parseFloat(this.currentTheme.radius);
        document.getElementById('borderRadiusValue').textContent = this.currentTheme.radius;
        document.getElementById('spacing').value = parseFloat(this.currentTheme.spacing);
        document.getElementById('spacingValue').textContent = this.currentTheme.spacing;
        
        // Update animations
        document.getElementById('animationDuration').value = parseFloat(this.currentTheme.animationDuration);
        document.getElementById('animationDurationValue').textContent = this.currentTheme.animationDuration;
        document.getElementById('motionReduce').checked = this.currentTheme.motionReduce;
        
        // Update accessibility
        document.getElementById('contrastRatio').value = this.currentTheme.contrastRatio;
        document.getElementById('contrastRatioValue').textContent = this.currentTheme.contrastRatio + ':1';
        document.getElementById('highContrast').checked = this.currentTheme.highContrast;
        document.getElementById('focusVisible').checked = this.currentTheme.focusVisible;
    }

    resetTheme() {
        this.currentTheme = {
            primary: '#d4af37',
            secondary: '#3b82f6',
            accent: '#10b981',
            background: '#ffffff',
            surface: '#f8fafc',
            text: '#1e293b',
            textMuted: '#64748b',
            border: '#e2e8f0',
            shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            radius: '0.5rem',
            fontFamily: 'Inter',
            fontSize: '1rem',
            lineHeight: '1.5',
            spacing: '1rem',
            transition: 'all 0.15s ease',
            animationDuration: '0.3s',
            animationEasing: 'ease-in-out',
            contrastRatio: '4.5',
            fontSizeScale: '1',
            motionReduce: false,
            highContrast: false,
            focusVisible: true,
            printColor: true,
            printBackground: false,
            printMargins: '1in',
            printOrientation: 'portrait',
            printSize: 'A4'
        };
        
        this.updateUI();
        this.applyTheme();
        this.saveTheme();
    }

    clearTheme() {
        localStorage.removeItem('angkor-compliance-theme');
        this.resetTheme();
    }

    saveTheme() {
        localStorage.setItem('angkor-compliance-theme', JSON.stringify(this.currentTheme));
    }

    loadSavedTheme() {
        const saved = localStorage.getItem('angkor-compliance-theme');
        if (saved) {
            try {
                this.currentTheme = { ...this.currentTheme, ...JSON.parse(saved) };
            } catch (error) {
                console.error('Error loading saved theme:', error);
            }
        }
    }
}

// Initialize theme customizer
document.addEventListener('DOMContentLoaded', () => {
    window.themeCustomizer = new ThemeCustomizer();
});

// Global access
window.ThemeCustomizer = ThemeCustomizer;
