# Angkor Compliance Platform - 2025 Design System Documentation

## Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Design Tokens](#design-tokens)
4. [Components](#components)
5. [Layout System](#layout-system)
6. [Role-Specific Themes](#role-specific-themes)
7. [Accessibility](#accessibility)
8. [Performance](#performance)
9. [Cross-Browser Compatibility](#cross-browser-compatibility)
10. [Implementation Guide](#implementation-guide)
11. [Migration Guide](#migration-guide)
12. [Best Practices](#best-practices)
13. [Troubleshooting](#troubleshooting)
14. [Contributing](#contributing)

## Overview

The Angkor Compliance Platform 2025 Design System is a comprehensive, modern design system built for compliance management in Cambodia. It incorporates the latest 2025 design trends while maintaining accessibility, performance, and cross-browser compatibility.

### Key Features

- **Modern 2025 Design Trends**: Glassmorphism, Neumorphism 2.0, Bento Grids
- **Role-Specific Themes**: Customized experiences for different user roles
- **WCAG 2.1 AA Compliance**: Full accessibility support
- **Performance Optimized**: Critical CSS, lazy loading, GPU acceleration
- **Cross-Browser Compatible**: Fallbacks for all modern CSS features
- **Responsive Design**: Mobile-first approach with touch-friendly components
- **Dark Mode Support**: Automatic and manual dark mode switching
- **Print Optimized**: Professional print styles for reports and documentation

## Design Principles

### 1. Accessibility First
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion support

### 2. Performance Focused
- Critical CSS loading
- Lazy loading implementation
- GPU acceleration
- Optimized animations
- Efficient resource loading

### 3. User-Centered Design
- Role-specific experiences
- Intuitive navigation
- Clear information hierarchy
- Consistent interactions
- Responsive design

### 4. Modern Aesthetics
- 2025 design trends
- Glassmorphism effects
- Neumorphism components
- Micro-interactions
- Smooth animations

## Design Tokens

### Color System

#### Primary Colors
```css
--primary-50: #fefce8;
--primary-100: #fef3c7;
--primary-200: #fde68a;
--primary-300: #fcd34d;
--primary-400: #fbbf24;
--primary-500: #d4af37; /* Main brand color */
--primary-600: #b8941f;
--primary-700: #9c7c1a;
--primary-800: #806415;
--primary-900: #644c10;
```

#### Secondary Colors
```css
--secondary-50: #eff6ff;
--secondary-100: #dbeafe;
--secondary-200: #bfdbfe;
--secondary-300: #93c5fd;
--secondary-400: #60a5fa;
--secondary-500: #3b82f6;
--secondary-600: #2563eb;
--secondary-700: #1d4ed8;
--secondary-800: #1e40af;
--secondary-900: #1e3a8a;
```

#### Success Colors
```css
--success-50: #f0fff4;
--success-100: #dcfce7;
--success-200: #bbf7d0;
--success-300: #86efac;
--success-400: #4ade80;
--success-500: #22c55e;
--success-600: #16a34a;
--success-700: #15803d;
--success-800: #166534;
--success-900: #14532d;
```

#### Warning Colors
```css
--warning-50: #fffbeb;
--warning-100: #fef3c7;
--warning-200: #fde68a;
--warning-300: #fcd34d;
--warning-400: #fbbf24;
--warning-500: #f59e0b;
--warning-600: #d97706;
--warning-700: #b45309;
--warning-800: #92400e;
--warning-900: #78350f;
```

#### Danger Colors
```css
--danger-50: #fef2f2;
--danger-100: #fee2e2;
--danger-200: #fecaca;
--danger-300: #fca5a5;
--danger-400: #f87171;
--danger-500: #ef4444;
--danger-600: #dc2626;
--danger-700: #b91c1c;
--danger-800: #991b1b;
--danger-900: #7f1d1d;
```

#### Info Colors
```css
--info-50: #f0f9ff;
--info-100: #e0f2fe;
--info-200: #bae6fd;
--info-300: #7dd3fc;
--info-400: #38bdf8;
--info-500: #0ea5e9;
--info-600: #0284c7;
--info-700: #0369a1;
--info-800: #075985;
--info-900: #0c4a6e;
```

### Typography

#### Font Families
```css
--font-sans: 'Inter', 'Noto Sans Khmer', system-ui, -apple-system, sans-serif;
--font-serif: 'Cambria', 'Times New Roman', serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

#### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
```

#### Font Weights
```css
--font-thin: 100;
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
--font-black: 900;
```

#### Line Heights
```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Spacing

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

### Border Radius

```css
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-3xl: 1.5rem;    /* 24px */
--radius-full: 9999px;
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
```

### Transitions

```css
--transition-all: all 0.15s ease;
--transition-colors: color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
--transition-opacity: opacity 0.15s ease;
--transition-transform: transform 0.15s ease;
--transition-shadow: box-shadow 0.15s ease;
```

## Components

### Buttons

#### Basic Button
```html
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>
<button class="btn btn-success">Success Button</button>
<button class="btn btn-warning">Warning Button</button>
<button class="btn btn-danger">Danger Button</button>
<button class="btn btn-info">Info Button</button>
```

#### Button Sizes
```html
<button class="btn btn-primary btn-xs">Extra Small</button>
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-md">Medium</button>
<button class="btn btn-primary btn-lg">Large</button>
<button class="btn btn-primary btn-xl">Extra Large</button>
```

#### Button Variants
```html
<button class="btn btn-primary btn-outline">Outline</button>
<button class="btn btn-primary btn-ghost">Ghost</button>
<button class="btn btn-primary btn-link">Link</button>
```

#### Button Effects
```html
<button class="btn btn-primary btn-gradient">Gradient</button>
<button class="btn btn-primary btn-shine">Shine</button>
<button class="btn btn-primary btn-glow">Glow</button>
<button class="btn btn-primary btn-float">Float</button>
<button class="btn btn-primary btn-bounce">Bounce</button>
<button class="btn btn-primary btn-pulse">Pulse</button>
<button class="btn btn-primary btn-ripple">Ripple</button>
<button class="btn btn-primary btn-magnetic">Magnetic</button>
<button class="btn btn-primary btn-3d">3D</button>
```

### Cards

#### Basic Card
```html
<div class="card">
    <div class="card-header">
        <h3 class="card-title">Card Title</h3>
    </div>
    <div class="card-body">
        <p>Card content goes here.</p>
    </div>
    <div class="card-footer">
        <button class="btn btn-primary">Action</button>
    </div>
</div>
```

#### Card Variants
```html
<div class="card card-glass">Glass Card</div>
<div class="card card-neumorphism">Neumorphism Card</div>
<div class="card card-elevated">Elevated Card</div>
<div class="card card-flat">Flat Card</div>
```

### Forms

#### Form Input
```html
<div class="form-group">
    <label for="email" class="form-label">Email Address</label>
    <input type="email" id="email" class="form-input" placeholder="Enter your email">
    <div class="form-help">We'll never share your email.</div>
</div>
```

#### Form Validation
```html
<div class="form-group">
    <label for="password" class="form-label">Password</label>
    <input type="password" id="password" class="form-input form-input-error" placeholder="Enter your password">
    <div class="form-error">Password must be at least 8 characters.</div>
</div>
```

#### Form Checkbox
```html
<div class="form-checkbox">
    <input type="checkbox" id="terms" class="form-checkbox-input">
    <label for="terms" class="form-checkbox-label">I agree to the terms and conditions</label>
</div>
```

#### Form Radio
```html
<div class="form-radio">
    <input type="radio" id="option1" name="option" class="form-radio-input">
    <label for="option1" class="form-radio-label">Option 1</label>
</div>
```

#### Form Switch
```html
<div class="form-switch">
    <input type="checkbox" id="notifications" class="form-switch-input">
    <label for="notifications" class="form-switch-label">Enable notifications</label>
</div>
```

### Alerts

#### Basic Alert
```html
<div class="alert alert-success">
    <div class="alert-icon">
        <i data-lucide="check-circle"></i>
    </div>
    <div class="alert-content">
        <h4 class="alert-title">Success!</h4>
        <p class="alert-message">Your action was completed successfully.</p>
    </div>
    <button class="alert-close">
        <i data-lucide="x"></i>
    </button>
</div>
```

#### Alert Types
```html
<div class="alert alert-info">Info Alert</div>
<div class="alert alert-success">Success Alert</div>
<div class="alert alert-warning">Warning Alert</div>
<div class="alert alert-danger">Danger Alert</div>
```

### Progress Indicators

#### Progress Bar
```html
<div class="progress">
    <div class="progress-bar" style="width: 75%"></div>
</div>
```

#### Progress Ring
```html
<div class="progress-ring" data-progress="75">
    <svg class="progress-ring-circle" width="120" height="120">
        <circle class="progress-ring-background" cx="60" cy="60" r="50"></circle>
        <circle class="progress-ring-progress" cx="60" cy="60" r="50"></circle>
    </svg>
    <div class="progress-ring-text">75%</div>
</div>
```

#### Spinner
```html
<div class="spinner spinner-lg"></div>
```

### Avatars

#### Basic Avatar
```html
<div class="avatar avatar-md avatar-worker">
    <img src="user.jpg" alt="User">
</div>
```

#### Avatar with Status
```html
<div class="avatar avatar-md avatar-worker">
    <img src="user.jpg" alt="User">
    <div class="avatar-status online"></div>
</div>
```

#### Avatar with Badge
```html
<div class="avatar avatar-md avatar-worker">
    <img src="user.jpg" alt="User">
    <div class="avatar-badge">3</div>
</div>
```

### Icons

#### Basic Icon
```html
<i data-lucide="user" class="icon icon-md icon-primary"></i>
```

#### Icon Button
```html
<button class="icon-btn icon-btn-primary">
    <i data-lucide="plus"></i>
</button>
```

#### Icon with Tooltip
```html
<i data-lucide="help-circle" class="icon icon-md icon-tooltip" data-tooltip="Help text"></i>
```

## Layout System

### Container
```html
<div class="container">
    <!-- Content -->
</div>
```

### Grid System
```html
<div class="grid grid-cols-3 gap-4">
    <div class="grid-item">Item 1</div>
    <div class="grid-item">Item 2</div>
    <div class="grid-item">Item 3</div>
</div>
```

### Bento Grid
```html
<div class="bento-grid">
    <div class="bento-item bento-item-large">Large Item</div>
    <div class="bento-item">Small Item</div>
    <div class="bento-item">Small Item</div>
    <div class="bento-item bento-item-wide">Wide Item</div>
</div>
```

### Flexbox
```html
<div class="flex items-center justify-between">
    <div>Left Content</div>
    <div>Right Content</div>
</div>
```

## Role-Specific Themes

### Worker Theme
```html
<div class="role-theme worker">
    <!-- Worker-specific content -->
</div>
```

### Factory Admin Theme
```html
<div class="role-theme factory-admin">
    <!-- Factory admin-specific content -->
</div>
```

### HR Staff Theme
```html
<div class="role-theme hr-staff">
    <!-- HR staff-specific content -->
</div>
```

### Grievance Committee Theme
```html
<div class="role-theme grievance-committee">
    <!-- Grievance committee-specific content -->
</div>
```

### Auditor Theme
```html
<div class="role-theme auditor">
    <!-- Auditor-specific content -->
</div>
```

### Analytics User Theme
```html
<div class="role-theme analytics-user">
    <!-- Analytics user-specific content -->
</div>
```

### Super Admin Theme
```html
<div class="role-theme super-admin">
    <!-- Super admin-specific content -->
</div>
```

## Accessibility

### Focus Management
- All interactive elements are keyboard accessible
- Focus indicators are clearly visible
- Tab order is logical and intuitive

### Screen Reader Support
- ARIA labels and descriptions
- Semantic HTML structure
- Live regions for dynamic content

### Color Contrast
- WCAG 2.1 AA compliant contrast ratios
- High contrast mode support
- Color blind friendly palettes

### Keyboard Navigation
- Tab navigation support
- Keyboard shortcuts
- Focus trap for modals

### Touch Targets
- Minimum 44px touch targets
- Adequate spacing between interactive elements
- Touch-friendly interactions

## Performance

### Critical CSS
- Above-the-fold styles loaded first
- Non-critical styles loaded asynchronously
- Optimized CSS delivery

### Lazy Loading
- Images loaded on demand
- Content loaded as needed
- Components loaded dynamically

### GPU Acceleration
- Hardware acceleration for animations
- Optimized transforms and transitions
- Smooth 60fps animations

### Resource Optimization
- Minified CSS and JavaScript
- Compressed images
- Efficient font loading

## Cross-Browser Compatibility

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Internet Explorer 11 (with fallbacks)

### Fallbacks
- CSS Grid fallbacks using Flexbox
- Custom properties fallbacks
- Modern CSS feature fallbacks

### Polyfills
- Intersection Observer polyfill
- Custom properties polyfill
- Modern JavaScript polyfills

## Implementation Guide

### 1. Include CSS Files
```html
<link rel="stylesheet" href="assets/css/design-tokens-2025.css">
<link rel="stylesheet" href="assets/css/components-2025.css">
<link rel="stylesheet" href="assets/css/layout-2025.css">
<link rel="stylesheet" href="assets/css/role-themes-2025.css">
```

### 2. Include JavaScript Files
```html
<script src="assets/js/role-switching-2025.js"></script>
<script src="assets/js/dark-mode-2025.js"></script>
<script src="assets/js/accessibility-2025.js"></script>
<script src="assets/js/performance-2025.js"></script>
```

### 3. Initialize Components
```javascript
// Initialize role switching
window.roleSwitcher.init();

// Initialize dark mode
window.darkModeManager.init();

// Initialize accessibility
window.accessibilityManager.init();

// Initialize performance monitoring
window.performanceManager.init();
```

### 4. Add Role Theme
```html
<body class="role-theme worker">
    <!-- Your content -->
</body>
```

## Migration Guide

### From 2024 Design System

1. **Update CSS Imports**
   ```html
   <!-- Old -->
   <link rel="stylesheet" href="assets/css/main.css">
   
   <!-- New -->
   <link rel="stylesheet" href="assets/css/design-tokens-2025.css">
   <link rel="stylesheet" href="assets/css/components-2025.css">
   <link rel="stylesheet" href="assets/css/layout-2025.css">
   <link rel="stylesheet" href="assets/css/role-themes-2025.css">
   ```

2. **Update Class Names**
   ```html
   <!-- Old -->
   <button class="btn-primary">Button</button>
   
   <!-- New -->
   <button class="btn btn-primary">Button</button>
   ```

3. **Add Role Themes**
   ```html
   <!-- Old -->
   <body>
   
   <!-- New -->
   <body class="role-theme worker">
   ```

4. **Update JavaScript**
   ```html
   <!-- Old -->
   <script src="assets/js/main.js"></script>
   
   <!-- New -->
   <script src="assets/js/role-switching-2025.js"></script>
   <script src="assets/js/dark-mode-2025.js"></script>
   <script src="assets/js/accessibility-2025.js"></script>
   <script src="assets/js/performance-2025.js"></script>
   ```

## Best Practices

### 1. Use Semantic HTML
```html
<!-- Good -->
<button class="btn btn-primary">Submit</button>

<!-- Bad -->
<div class="btn btn-primary">Submit</div>
```

### 2. Include ARIA Labels
```html
<!-- Good -->
<button class="btn btn-primary" aria-label="Submit form">Submit</button>

<!-- Bad -->
<button class="btn btn-primary">Submit</button>
```

### 3. Use Role Themes
```html
<!-- Good -->
<body class="role-theme worker">

<!-- Bad -->
<body>
```

### 4. Optimize Images
```html
<!-- Good -->
<img src="image.jpg" alt="Descriptive text" loading="lazy">

<!-- Bad -->
<img src="image.jpg">
```

### 5. Use Consistent Spacing
```html
<!-- Good -->
<div class="card p-4 m-4">

<!-- Bad -->
<div class="card" style="padding: 16px; margin: 16px;">
```

## Troubleshooting

### Common Issues

#### 1. Styles Not Loading
- Check CSS file paths
- Verify file permissions
- Check browser console for errors

#### 2. JavaScript Not Working
- Check JavaScript file paths
- Verify file permissions
- Check browser console for errors

#### 3. Role Themes Not Applying
- Ensure role theme class is on body element
- Check CSS file loading order
- Verify role theme CSS is included

#### 4. Dark Mode Not Working
- Check dark mode JavaScript is loaded
- Verify dark mode CSS is included
- Check browser console for errors

#### 5. Accessibility Issues
- Run accessibility validator
- Check ARIA labels
- Verify keyboard navigation

### Debug Mode

Enable debug mode to see additional information:

```javascript
// Enable debug mode
window.DEBUG = true;

// Check component initialization
console.log(window.roleSwitcher);
console.log(window.darkModeManager);
console.log(window.accessibilityManager);
console.log(window.performanceManager);
```

## Contributing

### Development Setup

1. Clone the repository
2. Install dependencies
3. Run development server
4. Make changes
5. Test changes
6. Submit pull request

### Code Standards

- Use semantic HTML
- Follow BEM naming convention
- Include ARIA labels
- Test accessibility
- Optimize performance
- Cross-browser test

### Testing

- Run accessibility tests
- Test cross-browser compatibility
- Check performance metrics
- Validate HTML/CSS
- Test responsive design

---

For more information, visit the [Angkor Compliance Platform Documentation](https://docs.angkor-compliance.com) or contact the development team.
