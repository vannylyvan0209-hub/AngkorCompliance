# 🎓 Team Training Guide - 2025 Design System

## 📋 **OVERVIEW**

**Project:** Angkor Compliance Platform - 2025 Design System Training  
**Training Date:** January 2025  
**Status:** ✅ **READY FOR TEAM TRAINING**  
**Target Audience:** Development Team, Designers, QA Engineers  
**Duration:** 4-6 hours (can be split into sessions)

---

## 🎯 **TRAINING OBJECTIVES**

By the end of this training, team members will be able to:

1. **Understand** the 2025 design system architecture and principles
2. **Implement** new pages using the 2025 design system components
3. **Maintain** existing pages with proper design system practices
4. **Troubleshoot** common issues and performance problems
5. **Contribute** to the design system evolution and improvements

---

## 📚 **TRAINING MODULES**

### **Module 1: Design System Foundation (1 hour)**
- Design philosophy and principles
- File structure and organization
- Design tokens and CSS custom properties
- Role-based theming system

### **Module 2: Component Library (1.5 hours)**
- Button components and variants
- Form components and validation
- Card components and layouts
- Navigation and menu systems

### **Module 3: Layout Systems (1 hour)**
- Bento grid system
- Responsive design patterns
- Container and spacing utilities
- Mobile-first approach

### **Module 4: Advanced Features (1.5 hours)**
- Glassmorphism and neumorphism effects
- Animation system (AOS)
- Dark mode implementation
- Accessibility features

### **Module 5: Implementation Best Practices (1 hour)**
- Code organization and naming conventions
- Performance optimization
- Cross-browser compatibility
- Testing and validation

---

## 🏗️ **MODULE 1: DESIGN SYSTEM FOUNDATION**

### **1.1 Design Philosophy**

The 2025 design system is built on these core principles:

```css
/* Cultural Heritage */
- Angkor Heritage: Inspired by Cambodian cultural heritage with gold accents
- Professional Trust: Clean, corporate aesthetic that builds confidence
- Compliance Focus: Structured, organized interface reflecting regulatory requirements

/* 2025 Design Trends */
- Glassmorphism: Frosted glass effects with backdrop blur
- Neumorphism 2.0: Soft, tactile UI elements with subtle shadows
- Micro-interactions: Subtle animations that enhance user experience
- Bento Grid Layouts: Asymmetrical, organized content presentation
```

### **1.2 File Structure**

```
assets/css/
├── design-tokens-2025.css      # Core design tokens and variables
├── components-2025.css         # Component library
├── layout-2025.css            # Layout system and utilities
└── role-themes-2025.css       # Role-specific theming

assets/js/
├── role-switching-2025.js     # Role switching functionality
├── dark-mode-2025.js          # Dark mode implementation
├── animations-2025.js         # Animation system
└── accessibility-2025.js      # Accessibility features
```

### **1.3 Design Tokens**

```css
/* Color System */
:root {
    /* Primary Colors (Gold Theme) */
    --primary-500: #D4AF37;  /* Main brand gold */
    --primary-600: #B8941F;  /* Darker gold */
    --primary-700: #8B6914;  /* Darkest gold */
    
    /* Role-Specific Colors */
    --worker-primary: #D4AF37;           /* Gold */
    --factory-admin-primary: #B8941F;    /* Dark Gold */
    --hr-staff-primary: #22c55e;         /* Green */
    --grievance-committee-primary: #f59e0b; /* Orange */
    --auditor-primary: #3b82f6;          /* Blue */
    --analytics-user-primary: #8b5cf6;   /* Purple */
    --super-admin-primary: #ef4444;      /* Red */
}
```

### **1.4 Role-Based Theming**

```html
<!-- Apply role theme to body -->
<body class="role-theme worker">
<body class="role-theme factory-admin">
<body class="role-theme hr-staff">
<body class="role-theme grievance-committee">
<body class="role-theme auditor">
<body class="role-theme analytics-user">
<body class="role-theme super-admin">
```

---

## 🧩 **MODULE 2: COMPONENT LIBRARY**

### **2.1 Button Components**

```html
<!-- Basic Buttons -->
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>
<button class="btn btn-ghost">Ghost Button</button>
<button class="btn btn-outline">Outline Button</button>

<!-- Button Sizes -->
<button class="btn btn-primary btn-xs">Extra Small</button>
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary">Default</button>
<button class="btn btn-primary btn-lg">Large</button>
<button class="btn btn-primary btn-xl">Extra Large</button>

<!-- Special Styles -->
<button class="btn btn-glass">Glassmorphism</button>
<button class="btn btn-neu">Neumorphism</button>

<!-- Semantic Colors -->
<button class="btn btn-success">Success</button>
<button class="btn btn-warning">Warning</button>
<button class="btn btn-danger">Danger</button>
<button class="btn btn-info">Info</button>
```

### **2.2 Form Components**

```html
<!-- Basic Form -->
<form class="role-form">
    <div class="form-group">
        <label class="form-label" for="email">Email Address</label>
        <input type="email" class="form-input" id="email" placeholder="Enter your email">
    </div>
    
    <div class="form-group">
        <label class="form-label" for="role">Role</label>
        <select class="form-input form-select" id="role">
            <option>Select your role</option>
            <option>Worker</option>
            <option>Factory Admin</option>
        </select>
    </div>
    
    <div class="form-group">
        <label class="form-label" for="message">Message</label>
        <textarea class="form-input form-textarea" id="message" placeholder="Enter your message"></textarea>
    </div>
    
    <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

### **2.3 Card Components**

```html
<!-- Glass Card -->
<div class="card">
    <div class="card-header">
        <h4>Card Header</h4>
    </div>
    <div class="card-body">
        <p>Card content goes here.</p>
    </div>
    <div class="card-footer">
        <button class="btn btn-primary btn-sm">Action</button>
    </div>
</div>

<!-- Neumorphism Card -->
<div class="card card-neu">
    <div class="card-header">
        <h4>Neumorphism Card</h4>
    </div>
    <div class="card-body">
        <p>Soft, tactile design with subtle shadows.</p>
    </div>
</div>
```

### **2.4 Navigation System**

```html
<!-- 2025 Navigation -->
<nav class="role-nav">
    <div class="nav">
        <div class="nav-brand">
            <img src="logo.png" alt="Angkor Compliance" class="logo">
            <span class="brand-text">Dashboard</span>
        </div>
        <div class="nav-items">
            <div class="nav-item">
                <a href="#dashboard" class="nav-link active">
                    <i data-lucide="home"></i>
                    <span>Dashboard</span>
                </a>
            </div>
            <div class="nav-item">
                <a href="#workers" class="nav-link">
                    <i data-lucide="users"></i>
                    <span>Workers</span>
                </a>
            </div>
        </div>
    </div>
    <div class="nav-actions">
        <div class="language-selector">
            <select id="languageSelect" class="form-select">
                <option value="en">English</option>
                <option value="km">ខ្មែរ</option>
            </select>
        </div>
        <div class="role-selector">
            <label for="roleSelect" class="role-label">Role:</label>
            <select id="roleSelect" onchange="changeRole(this.value)" class="form-select">
                <option value="worker">Worker</option>
                <option value="factory-admin">Factory Admin</option>
            </select>
        </div>
    </div>
</nav>
```

---

## 📐 **MODULE 3: LAYOUT SYSTEMS**

### **3.1 Bento Grid System**

```html
<!-- Basic Bento Grid -->
<div class="bento-grid">
    <div class="bento-item bento-item-sm">Small item</div>
    <div class="bento-item bento-item-md">Medium item</div>
    <div class="bento-item bento-item-lg">Large item</div>
    <div class="bento-item bento-item-xl">Extra large item</div>
</div>

<!-- Bento Cards -->
<div class="bento-grid">
    <div class="bento-card bento-hero">
        <div class="card-content">
            <h1>Hero Section</h1>
            <p>Main content area</p>
        </div>
    </div>
    <div class="bento-card bento-stat">
        <div class="card-content">
            <div class="stat-value">42</div>
            <div class="stat-label">Total Users</div>
        </div>
    </div>
</div>
```

### **3.2 Container System**

```html
<!-- Basic Container -->
<div class="container">
    <!-- Content goes here -->
</div>

<!-- Container Variants -->
<div class="container-fluid">Fluid container</div>
<div class="container-narrow">Narrow container</div>
<div class="container-wide">Wide container</div>
```

### **3.3 Responsive Design**

```css
/* Mobile First Approach */
@media (max-width: 640px) { /* Small devices */ }
@media (min-width: 641px) and (max-width: 768px) { /* Medium devices */ }
@media (min-width: 769px) and (max-width: 1024px) { /* Large devices */ }
@media (min-width: 1025px) { /* Extra large devices */ }
```

---

## ✨ **MODULE 4: ADVANCED FEATURES**

### **4.1 Glassmorphism Effects**

```css
/* Glass Card */
.glass-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### **4.2 Neumorphism Effects**

```css
/* Neumorphism Button */
.btn-neu {
    background: var(--neu-light);
    box-shadow: var(--neu-shadow-light);
    border: none;
}

.btn-neu:active {
    box-shadow: var(--neu-inset-light);
}
```

### **4.3 Animation System (AOS)**

```html
<!-- Add AOS animations -->
<div data-aos="fade-up" data-aos-delay="100">
    <h2>Animated Title</h2>
</div>

<div data-aos="fade-left" data-aos-delay="200">
    <p>Animated content</p>
</div>
```

### **4.4 Dark Mode Implementation**

```javascript
// Initialize dark mode
if (window.darkMode) {
    window.darkMode.init();
}

// Toggle dark mode
function toggleDarkMode() {
    if (window.darkMode) {
        window.darkMode.toggle();
    }
}
```

### **4.5 Accessibility Features**

```html
<!-- Focus management -->
<button class="btn btn-primary" tabindex="0">Accessible Button</button>

<!-- ARIA labels -->
<div class="card" role="region" aria-label="User Statistics">
    <h3 id="stats-title">Statistics</h3>
    <div aria-labelledby="stats-title">
        <!-- Stats content -->
    </div>
</div>
```

---

## 🛠️ **MODULE 5: IMPLEMENTATION BEST PRACTICES**

### **5.1 Code Organization**

```html
<!-- Page Structure Template -->
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- 2025 Design System CSS -->
    <link rel="stylesheet" href="assets/css/design-tokens-2025.css">
    <link rel="stylesheet" href="assets/css/components-2025.css">
    <link rel="stylesheet" href="assets/css/layout-2025.css">
    <link rel="stylesheet" href="assets/css/role-themes-2025.css">
    
    <!-- Page-specific CSS -->
    <link rel="stylesheet" href="assets/css/page-specific-2025.css">
</head>
<body class="role-theme [role-name]">
    <!-- 2025 Navigation -->
    <nav class="role-nav">
        <!-- Navigation content -->
    </nav>
    
    <main class="portal-main">
        <!-- Page content with bento grids -->
        <section class="page-section">
            <div class="container">
                <div class="bento-grid">
                    <!-- Bento cards -->
                </div>
            </div>
        </section>
    </main>
    
    <!-- 2025 Design System JavaScript -->
    <script src="assets/js/role-switching-2025.js"></script>
    <script src="assets/js/dark-mode-2025.js"></script>
    <script src="assets/js/animations-2025.js"></script>
    <script src="assets/js/accessibility-2025.js"></script>
</body>
</html>
```

### **5.2 Naming Conventions**

```css
/* BEM Methodology */
.block__element--modifier

/* Examples */
.btn__icon--large
.card__header--primary
.nav__item--active
```

### **5.3 Performance Optimization**

```css
/* Critical CSS loading */
<link rel="preload" href="assets/css/design-tokens-2025.css" as="style">
<link rel="preload" href="assets/css/components-2025.css" as="style">

/* GPU acceleration */
.animated-element {
    transform: translateZ(0);
    will-change: transform;
}
```

### **5.4 Testing Checklist**

- [ ] **Responsive Design**: Test on mobile, tablet, desktop
- [ ] **Cross-browser**: Chrome, Firefox, Safari, Edge
- [ ] **Accessibility**: Screen reader, keyboard navigation
- [ ] **Performance**: Page load speed, animation smoothness
- [ ] **Dark Mode**: Toggle functionality, theme consistency
- [ ] **Role Switching**: All roles work correctly
- [ ] **Animations**: AOS animations trigger properly

---

## 🎯 **PRACTICAL EXERCISES**

### **Exercise 1: Create a New Dashboard Page**

**Task:** Create a new dashboard page for a "Quality Manager" role

**Requirements:**
1. Use the 2025 design system structure
2. Implement bento grid layout
3. Add role-specific theming
4. Include navigation and role switching
5. Add AOS animations

**Time:** 45 minutes

### **Exercise 2: Update Existing Page**

**Task:** Update an existing page to use 2025 design system

**Requirements:**
1. Replace legacy CSS with 2025 components
2. Convert layout to bento grid
3. Add glassmorphism effects
4. Implement responsive design
5. Test accessibility

**Time:** 30 minutes

### **Exercise 3: Create Custom Component**

**Task:** Create a custom component using design system tokens

**Requirements:**
1. Use design tokens for colors and spacing
2. Follow BEM naming conventions
3. Add hover and focus states
4. Include accessibility features
5. Test cross-browser compatibility

**Time:** 30 minutes

---

## 📖 **RESOURCES AND DOCUMENTATION**

### **Essential Files**
- `design-system-showcase-2025.html` - Complete component showcase
- `assets/css/design-tokens-2025.css` - All design tokens
- `assets/css/components-2025.css` - Component library
- `assets/css/layout-2025.css` - Layout system
- `assets/css/role-themes-2025.css` - Role theming

### **JavaScript Modules**
- `assets/js/role-switching-2025.js` - Role switching functionality
- `assets/js/dark-mode-2025.js` - Dark mode implementation
- `assets/js/animations-2025.js` - Animation system
- `assets/js/accessibility-2025.js` - Accessibility features

### **Reference Pages**
- `worker-portal.html` - Worker role implementation
- `factory-dashboard.html` - Factory admin implementation
- `pages/hr/hr-dashboard.html` - HR staff implementation
- `grievance-committee-dashboard.html` - Grievance committee implementation
- `auditor-dashboard.html` - Auditor implementation
- `analytics-dashboard.html` - Analytics user implementation
- `super-admin-dashboard.html` - Super admin implementation

---

## 🚀 **QUICK START GUIDE**

### **Step 1: Set Up New Page**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Page - Angkor Compliance Platform</title>
    
    <!-- 2025 Design System CSS -->
    <link rel="stylesheet" href="assets/css/design-tokens-2025.css">
    <link rel="stylesheet" href="assets/css/components-2025.css">
    <link rel="stylesheet" href="assets/css/layout-2025.css">
    <link rel="stylesheet" href="assets/css/role-themes-2025.css">
    
    <!-- Third-party Libraries -->
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
</head>
<body class="role-theme [your-role]">
    <!-- Your content here -->
</body>
</html>
```

### **Step 2: Add Navigation**

```html
<nav class="role-nav">
    <div class="nav">
        <div class="nav-brand">
            <img src="logo.png" alt="Angkor Compliance" class="logo">
            <span class="brand-text">Your Page</span>
        </div>
        <div class="nav-items">
            <!-- Navigation items -->
        </div>
    </div>
    <div class="nav-actions">
        <!-- Language and role selectors -->
    </div>
</nav>
```

### **Step 3: Create Content Layout**

```html
<main class="portal-main">
    <section class="page-section">
        <div class="container">
            <div class="bento-grid">
                <div class="bento-card bento-hero" data-aos="fade-up">
                    <div class="card-content">
                        <!-- Hero content -->
                    </div>
                </div>
                <div class="bento-card bento-stat" data-aos="fade-up" data-aos-delay="100">
                    <div class="card-content">
                        <!-- Stat content -->
                    </div>
                </div>
            </div>
        </div>
    </section>
</main>
```

### **Step 4: Add JavaScript**

```html
<!-- 2025 Design System JavaScript -->
<script src="assets/js/role-switching-2025.js"></script>
<script src="assets/js/dark-mode-2025.js"></script>
<script src="assets/js/animations-2025.js"></script>
<script src="assets/js/accessibility-2025.js"></script>

<script>
    // Initialize 2025 Design System
    document.addEventListener('DOMContentLoaded', function() {
        AOS.init();
        lucide.createIcons();
        
        if (window.roleSwitching) window.roleSwitching.init();
        if (window.darkMode) window.darkMode.init();
        if (window.accessibility) window.accessibility.init();
    });
</script>
```

---

## 🎓 **ASSESSMENT AND CERTIFICATION**

### **Knowledge Check Questions**

1. **Design System Architecture**
   - What are the four main CSS files in the 2025 design system?
   - How do you apply role-based theming to a page?
   - What is the difference between glassmorphism and neumorphism?

2. **Component Usage**
   - How do you create a primary button with an icon?
   - What are the different card variants available?
   - How do you implement the bento grid layout?

3. **Advanced Features**
   - How do you add AOS animations to elements?
   - How do you implement dark mode toggle?
   - What accessibility features are built into the design system?

4. **Best Practices**
   - What is the BEM naming convention?
   - How do you optimize performance with the design system?
   - What should you test when implementing a new page?

### **Practical Assessment**

**Task:** Create a complete dashboard page for a new role

**Criteria:**
- ✅ Proper file structure and imports
- ✅ Role-based theming implementation
- ✅ Bento grid layout usage
- ✅ Component library utilization
- ✅ Responsive design implementation
- ✅ Accessibility compliance
- ✅ Animation integration
- ✅ Cross-browser compatibility

**Passing Score:** 80% or higher

---

## 📞 **SUPPORT AND RESOURCES**

### **Team Contacts**
- **Design System Lead:** [Name] - [Email]
- **Frontend Lead:** [Name] - [Email]
- **QA Lead:** [Name] - [Email]

### **Documentation**
- **Design System Showcase:** `design-system-showcase-2025.html`
- **Implementation Guide:** `IMPLEMENTATION-TODO-2025.md`
- **Component Library:** `assets/css/components-2025.css`

### **Tools and Resources**
- **Figma Design System:** [Link]
- **Component Documentation:** [Link]
- **Performance Monitoring:** [Link]
- **Accessibility Testing:** [Link]

---

## 🎉 **CONCLUSION**

Congratulations! You've completed the 2025 Design System training. You now have the knowledge and skills to:

- ✅ Implement new pages using the 2025 design system
- ✅ Maintain existing pages with proper design system practices
- ✅ Create custom components following design system principles
- ✅ Troubleshoot common issues and optimize performance
- ✅ Contribute to the evolution of the design system

The Angkor Compliance Platform is now equipped with a world-class design system that provides:

- 🎨 **Modern Aesthetics**: Glassmorphism, neumorphism, and micro-interactions
- 📱 **Responsive Design**: Mobile-first approach with comprehensive breakpoints
- 🌙 **Dark Mode**: Automatic and manual dark mode toggle
- ♿ **Accessibility**: WCAG 2.1 AA compliance features
- 🔄 **Role-Based Theming**: Dynamic theming for each user role
- ⚡ **Performance**: Optimized loading and smooth animations
- 🌍 **Internationalization**: Multi-language support
- 🛡️ **Enterprise-Grade**: Professional, compliance-focused interface

**Remember:** The design system is a living document that evolves with the platform. Stay updated with new components, improvements, and best practices.

---

**Training Completed:** ✅  
**Certification Status:** Ready for Assessment  
**Next Steps:** Begin implementing 2025 design system in your projects!

---

*This training guide is part of the Angkor Compliance Platform 2025 Design System implementation. For questions or support, contact the design system team.*
