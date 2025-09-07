# Angkor Compliance CSS Architecture

## Overview
This directory contains a modular CSS architecture designed to prevent timeouts and improve maintainability. Instead of one large CSS file, styles are split into logical, focused modules.

## File Structure

```
assets/css/
├── README.md                           # This file
├── main.css                           # Main import file (entry point)
├── design-tokens.css                  # CSS variables and design tokens
├── utilities.css                      # Utility classes (spacing, typography, etc.)
├── components.css                     # Reusable component styles
├── layout.css                         # Layout and grid systems
├── auth.css                          # Authentication-specific styles
├── color-system.css                  # Color palette and theme
├── design-system.css                 # Design system foundations
├── factory-admin-settings.css        # Factory admin settings
├── landing.css                       # Landing page styles
├── mfa-setup.css                     # MFA setup styles
├── navigation.css                     # Navigation components
├── notification-system.css            # Notification styles
├── profile.css                       # Profile page styles
├── settings.css                      # Settings page styles
├── super-admin-navigation.css        # Super admin navigation
├── training-meetings.css             # Training and meetings
├── versioning.css                    # Versioning styles
├── worker-portal.css                 # Worker portal styles
├── auditor/                          # Auditor role styles
│   ├── auditor-base.css
│   ├── auditor-dashboard.css
│   ├── auditor-forms.css
│   ├── auditor-tables.css
│   ├── auditor-modals.css
│   └── auditor-charts.css
├── factory-admin/                     # Factory admin role styles
│   └── factory-admin-base.css
└── grievance-committee/               # Grievance committee styles
    ├── grievance-base.css
    └── grievance-forms.css
```

## How to Avoid Timeouts

### 1. **Edit Specific Modules Instead of Main Files**
```bash
# ✅ Good: Edit specific component
edit_file assets/css/components.css "Update button styles"

# ❌ Bad: Edit entire main.css
edit_file assets/css/main.css "Update everything"
```

### 2. **Use Incremental Edits**
```bash
# First: Add basic structure
edit_file target_file.css "Add basic component structure"

# Second: Add specific functionality
edit_file target_file.css "Add button variants"

# Third: Add responsive styles
edit_file target_file.css "Add mobile responsive styles"
```

### 3. **Use Search and Replace for Systematic Changes**
```bash
# For changing colors across multiple files
search_replace file.css "old-color" "new-color"
```

### 4. **Create New Files for New Features**
```bash
# Create new feature-specific CSS
edit_file assets/css/new-feature.css "Create new feature styles"
```

## Import Order

The `main.css` file imports modules in this specific order:

1. **Design Tokens** - CSS variables and foundations
2. **Utilities** - Common utility classes
3. **Components** - Reusable component styles
4. **Layout** - Layout and grid systems
5. **Role-specific** - Styles for different user roles
6. **Feature-specific** - Styles for specific features
7. **Responsive overrides** - Mobile-specific adjustments
8. **Print styles** - Print-specific styles

## Best Practices

### File Size Limits
- Keep individual files under **500-1000 lines**
- If a file grows too large, split it into sub-modules
- Use descriptive file names that indicate content

### Editing Guidelines
- **Never edit `main.css` directly** - it's just imports
- Edit specific module files for targeted changes
- Use clear, specific edit instructions
- Test changes in isolation before importing

### Adding New Styles
1. Determine the appropriate module file
2. Add styles to that file
3. Ensure the file is imported in `main.css`
4. Test the changes

### Performance Benefits
- **Better caching** - individual files can be cached separately
- **Faster editing** - smaller files process faster
- **Easier debugging** - isolate issues to specific modules
- **Team collaboration** - multiple developers can work on different modules

## Troubleshooting

### Import Issues
If styles aren't loading, check:
1. File paths in `main.css` imports
2. File permissions
3. CSS syntax errors in individual modules

### Missing Styles
If styles are missing:
1. Verify the module file exists
2. Check that it's imported in `main.css`
3. Ensure no CSS syntax errors

### Performance Issues
If performance degrades:
1. Check file sizes - keep under 1000 lines
2. Verify import order is correct
3. Remove unused CSS imports

## Migration from Monolithic CSS

If you're migrating from a large CSS file:

1. **Extract design tokens** to `design-tokens.css`
2. **Move utilities** to `utilities.css`
3. **Extract components** to `components.css`
4. **Move layout styles** to `layout.css`
5. **Update main.css** to import all modules
6. **Test thoroughly** to ensure no styles are lost

## Example: Adding a New Button Style

```bash
# 1. Edit the components file
edit_file assets/css/components.css "Add new button variant"

# 2. The change automatically appears in main.css
# because components.css is imported
```

This modular approach ensures that:
- ✅ No more timeouts when editing CSS
- ✅ Better organization and maintainability
- ✅ Easier debugging and testing
- ✅ Improved performance and caching
- ✅ Better team collaboration
