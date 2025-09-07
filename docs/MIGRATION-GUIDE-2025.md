# Angkor Compliance Platform - 2025 Design System Migration Guide

## 📋 Overview

This migration guide provides step-by-step instructions for updating existing pages to use the new 2025 design system. The guide covers CSS updates, HTML structure changes, and JavaScript enhancements.

## 🎯 Migration Checklist

### ✅ Pre-Migration Steps
- [ ] Backup existing files
- [ ] Test current functionality
- [ ] Document current styling
- [ ] Plan migration timeline

### ✅ CSS Migration
- [ ] Update CSS imports
- [ ] Replace old design tokens
- [ ] Update component classes
- [ ] Test responsive design

### ✅ HTML Migration
- [ ] Add role theme classes
- [ ] Update component structure
- [ ] Add role switching functionality
- [ ] Update icon usage

### ✅ JavaScript Migration
- [ ] Add role switching logic
- [ ] Update event handlers
- [ ] Test functionality
- [ ] Add accessibility features

## 🔄 Step-by-Step Migration Process

### Step 1: Update CSS Imports

#### Before (Old System)
```html
<!-- Old CSS imports -->
<link rel="stylesheet" href="assets/css/color-system.css">
<link rel="stylesheet" href="assets/css/design-tokens.css">
<link rel="stylesheet" href="assets/css/utilities.css">
<link rel="stylesheet" href="assets/css/components.css">
```

#### After (2025 Design System)
```html
<!-- 2025 Design System CSS -->
<link rel="stylesheet" href="assets/css/design-tokens-2025.css">
<link rel="stylesheet" href="assets/css/components-2025.css">
<link rel="stylesheet" href="assets/css/layout-2025.css">
<link rel="stylesheet" href="assets/css/role-themes-2025.css">
```

### Step 2: Update HTML Structure

#### Add Role Theme Class
```html
<!-- Before -->
<body>

<!-- After -->
<body class="role-theme worker">
```

#### Update Navigation Structure
```html
<!-- Before -->
<nav class="nav-menu">
    <div class="nav-links">
        <a href="#" class="nav-link">Dashboard</a>
    </div>
</nav>

<!-- After -->
<nav class="role-nav">
    <div class="nav">
        <div class="nav-item">
            <a href="#" class="nav-link">
                <i data-lucide="home"></i>
                <span>Dashboard</span>
            </a>
        </div>
    </div>
</nav>
```

#### Update Button Classes
```html
<!-- Before -->
<button class="btn btn-primary">Click Me</button>

<!-- After -->
<button class="btn btn-primary">
    <i data-lucide="check"></i>
    <span>Click Me</span>
</button>
```

### Step 3: Add Role Switching Component

#### Add Role Selector
```html
<div class="role-selector">
    <label for="roleSelect" style="font-size: var(--text-sm); color: var(--neutral-600); margin-right: var(--space-2);">Role:</label>
    <select id="roleSelect" onchange="changeRole(this.value)" style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-2) var(--space-3); font-size: var(--text-sm); color: var(--neutral-700);">
        <option value="worker">Worker</option>
        <option value="factory-admin">Factory Admin</option>
        <option value="hr-staff">HR Staff</option>
        <option value="grievance-committee">Grievance Committee</option>
        <option value="auditor">Auditor</option>
        <option value="analytics-user">Analytics User</option>
        <option value="super-admin">Super Admin</option>
    </select>
</div>
```

### Step 4: Add JavaScript Functionality

#### Add Role Switching Script
```javascript
// Role switching functionality
function changeRole(role) {
    const body = document.body;
    body.className = `role-theme ${role}`;
    
    // Update role status elements
    const roleStatuses = document.querySelectorAll('.role-status');
    roleStatuses.forEach(status => {
        status.className = `role-status ${role}`;
    });
    
    // Update any role-specific content
    updateRoleContent(role);
}

function updateRoleContent(role) {
    // Update content based on role
    const roleContent = {
        'worker': {
            title: 'Worker Dashboard',
            subtitle: 'Access your compliance information'
        },
        'factory-admin': {
            title: 'Factory Admin Dashboard',
            subtitle: 'Manage your factory operations'
        }
        // ... other roles
    };
    
    if (roleContent[role]) {
        // Update page content
        const title = document.querySelector('.page-title');
        const subtitle = document.querySelector('.page-subtitle');
        
        if (title) title.textContent = roleContent[role].title;
        if (subtitle) subtitle.textContent = roleContent[role].subtitle;
    }
}

// Initialize Lucide icons
lucide.createIcons();
```

## 🎨 Component Migration Examples

### Button Migration

#### Old Button
```html
<button class="btn btn-primary">Submit</button>
```

#### New Button (2025)
```html
<button class="btn btn-primary">
    <i data-lucide="check"></i>
    <span>Submit</span>
</button>
```

### Card Migration

#### Old Card
```html
<div class="card">
    <div class="card-header">
        <h3>Card Title</h3>
    </div>
    <div class="card-body">
        <p>Card content</p>
    </div>
</div>
```

#### New Card (2025)
```html
<div class="card">
    <div class="card-header">
        <h3>Card Title</h3>
    </div>
    <div class="card-body">
        <p>Card content</p>
    </div>
</div>
```

### Form Migration

#### Old Form
```html
<form>
    <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" class="form-control">
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

#### New Form (2025)
```html
<form class="role-form">
    <div class="form-group">
        <label class="form-label" for="email">Email</label>
        <input type="email" id="email" class="form-input">
    </div>
    <button type="submit" class="btn btn-primary">
        <i data-lucide="send"></i>
        <span>Submit</span>
    </button>
</form>
```

## 🎭 Role-Specific Migration

### Worker Role
```html
<body class="role-theme worker">
    <!-- Worker-specific content -->
    <div class="role-widget">
        <div class="role-widget-header">
            <div class="role-widget-icon">
                <i data-lucide="hard-hat"></i>
            </div>
            <h3 class="role-widget-title">Worker Dashboard</h3>
        </div>
        <div class="role-widget-content">
            <p>Your compliance information and tasks.</p>
        </div>
    </div>
</body>
```

### Factory Admin Role
```html
<body class="role-theme factory-admin">
    <!-- Factory admin-specific content -->
    <div class="role-widget">
        <div class="role-widget-header">
            <div class="role-widget-icon">
                <i data-lucide="building"></i>
            </div>
            <h3 class="role-widget-title">Factory Management</h3>
        </div>
        <div class="role-widget-content">
            <p>Manage your factory operations and compliance.</p>
        </div>
    </div>
</body>
```

## 📱 Responsive Design Migration

### Mobile-First Approach
```css
/* Mobile-first responsive design */
.container {
    width: 100%;
    padding: var(--space-4);
}

@media (min-width: 640px) {
    .container {
        max-width: 640px;
        padding: var(--space-6);
    }
}

@media (min-width: 1024px) {
    .container {
        max-width: 1024px;
        padding: var(--space-8);
    }
}
```

### Bento Grid Layout
```html
<div class="bento-grid">
    <div class="bento-item bento-item-sm">Small item</div>
    <div class="bento-item bento-item-md">Medium item</div>
    <div class="bento-item bento-item-lg">Large item</div>
</div>
```

## ♿ Accessibility Migration

### Focus Management
```css
/* Focus visible improvements */
.btn:focus-visible,
.nav-link:focus-visible,
.form-input:focus-visible {
    outline: 2px solid var(--primary-500);
    outline-offset: 2px;
}
```

### Screen Reader Support
```html
<!-- Add ARIA labels -->
<button class="btn btn-primary" aria-label="Submit form">
    <i data-lucide="check" aria-hidden="true"></i>
    <span>Submit</span>
</button>
```

### Keyboard Navigation
```javascript
// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        // Handle tab navigation
    }
    if (e.key === 'Enter' || e.key === ' ') {
        // Handle enter/space on buttons
    }
});
```

## 🌙 Dark Mode Migration

### Automatic Dark Mode
```css
@media (prefers-color-scheme: dark) {
    :root {
        --neutral-50: #0a0a0a;
        --neutral-100: #171717;
        /* ... other dark mode overrides */
    }
}
```

### Manual Dark Mode Toggle
```html
<button id="darkModeToggle" class="btn btn-ghost">
    <i data-lucide="moon"></i>
    <span>Dark Mode</span>
</button>
```

```javascript
// Dark mode toggle functionality
document.getElementById('darkModeToggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});
```

## 🎨 Glassmorphism Migration

### Glass Cards
```html
<div class="card">
    <!-- Glassmorphism effect applied automatically -->
    <div class="card-header">
        <h3>Glass Card</h3>
    </div>
    <div class="card-body">
        <p>Content with glassmorphism effect</p>
    </div>
</div>
```

### Glass Buttons
```html
<button class="btn btn-glass">
    <i data-lucide="sparkles"></i>
    <span>Glass Button</span>
</button>
```

## 🎯 Neumorphism Migration

### Neumorphism Cards
```html
<div class="card card-neu">
    <div class="card-header">
        <h3>Neumorphism Card</h3>
    </div>
    <div class="card-body">
        <p>Content with neumorphism effect</p>
    </div>
</div>
```

### Neumorphism Buttons
```html
<button class="btn btn-neu">
    <i data-lucide="layers"></i>
    <span>Neumorphism Button</span>
</button>
```

## 🔧 Common Migration Issues

### Issue 1: CSS Conflicts
**Problem**: Old CSS conflicting with new design system
**Solution**: Remove old CSS imports and update class names

### Issue 2: Icon Display Issues
**Problem**: Icons not displaying correctly
**Solution**: Ensure Lucide icons are loaded and use correct data attributes

### Issue 3: Role Switching Not Working
**Problem**: Role themes not applying correctly
**Solution**: Check JavaScript console for errors and ensure role classes are correct

### Issue 4: Responsive Design Issues
**Problem**: Layout breaking on mobile devices
**Solution**: Use mobile-first approach and test on actual devices

## 📊 Migration Testing Checklist

### Visual Testing
- [ ] Check all components render correctly
- [ ] Verify role themes apply properly
- [ ] Test responsive design on different screen sizes
- [ ] Validate dark mode functionality

### Functionality Testing
- [ ] Test role switching functionality
- [ ] Verify form submissions work
- [ ] Check navigation functionality
- [ ] Test button interactions

### Accessibility Testing
- [ ] Test keyboard navigation
- [ ] Verify screen reader compatibility
- [ ] Check color contrast ratios
- [ ] Test focus indicators

### Performance Testing
- [ ] Check page load times
- [ ] Verify CSS loading performance
- [ ] Test JavaScript functionality
- [ ] Validate resource optimization

## 🚀 Post-Migration Steps

### 1. Update Documentation
- [ ] Update component documentation
- [ ] Create usage examples
- [ ] Document new features
- [ ] Update style guide

### 2. Train Team
- [ ] Conduct training sessions
- [ ] Create reference materials
- [ ] Set up support channels
- [ ] Document best practices

### 3. Monitor Performance
- [ ] Set up performance monitoring
- [ ] Track user feedback
- [ ] Monitor accessibility metrics
- [ ] Collect usage analytics

## 📚 Resources

### Design System Files
- `assets/css/design-tokens-2025.css` - Design tokens
- `assets/css/components-2025.css` - Component library
- `assets/css/layout-2025.css` - Layout system
- `assets/css/role-themes-2025.css` - Role theming

### Documentation
- `DESIGN-SYSTEM-2025.md` - Complete design system documentation
- `design-system-showcase-2025.html` - Interactive showcase
- `IMPLEMENTATION-TODO-2025.md` - Implementation roadmap

### External Resources
- [Lucide Icons](https://lucide.dev/) - Icon library
- [AOS Library](https://michalsnik.github.io/aos/) - Animation library
- [Inter Font](https://rsms.me/inter/) - Typography
- [Noto Sans Khmer](https://fonts.google.com/noto/specimen/Noto+Sans+Khmer) - Khmer font

## 🆘 Support

### Getting Help
- Check the design system documentation
- Review the showcase page for examples
- Test components in isolation
- Use browser developer tools for debugging

### Common Questions
1. **Q**: How do I add a new role theme?
   **A**: Add the role to the CSS variables in `role-themes-2025.css`

2. **Q**: Why aren't my icons showing?
   **A**: Ensure Lucide icons are loaded and use `data-lucide` attributes

3. **Q**: How do I customize colors?
   **A**: Override CSS custom properties in your page-specific CSS

4. **Q**: Can I use both old and new systems?
   **A**: Not recommended - migrate completely for consistency

---

**Version**: 2025.1.0  
**Last Updated**: January 2025  
**Maintainer**: Angkor Compliance Platform Team
