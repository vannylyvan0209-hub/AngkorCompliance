#!/usr/bin/env node

/**
 * Update CSS References Script - 2025 Design System
 * 
 * This script updates all HTML files to use the new main-2025.css file
 * instead of the old main-modern.css, design-system.css, and main-consolidated.css references.
 * 
 * Usage: node update-css-references-2025.js
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Configuration
const OLD_CSS_REFERENCES = [
    'assets/css/main-modern.css',
    'assets/css/design-system.css',
    'assets/css/main-consolidated.css',
    'assets/css/color-system.css',
    'assets/css/utilities.css',
    'assets/css/components.css',
    'assets/css/layout.css',
    'assets/css/auth.css',
    'assets/css/landing.css',
    'assets/css/mfa-setup.css',
    'assets/css/navigation.css',
    'assets/css/notification-system.css',
    'assets/css/profile.css',
    'assets/css/settings.css',
    'assets/css/super-admin-navigation.css',
    'assets/css/training-meetings.css',
    'assets/css/versioning.css',
    'assets/css/worker-portal.css',
    'assets/css/factory-admin-settings.css',
    'assets/css/homepage.css',
    'assets/css/new-homepage.css'
];

const NEW_CSS_REFERENCE = 'assets/css/main-2025.css';

// Find all HTML files
async function findHtmlFiles() {
    const pattern = '**/*.html';
    return await glob(pattern, { ignore: ['node_modules/**', '.git/**', 'backup*/**'] });
}

// Update CSS references in a single file
function updateCssReferences(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Remove old CSS references
        OLD_CSS_REFERENCES.forEach(oldRef => {
            const regex = new RegExp(`<link[^>]*href=["']${oldRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'gi');
            if (content.match(regex)) {
                content = content.replace(regex, '');
                updated = true;
            }
        });
        
        // Add new CSS reference if we removed any old ones
        if (updated) {
            // Find the head section and add the new CSS reference
            const headRegex = /(<head[^>]*>)/i;
            if (content.match(headRegex)) {
                content = content.replace(headRegex, `$1\n    <link rel="stylesheet" href="${NEW_CSS_REFERENCE}">`);
            }
        }
        
        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${filePath}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
async function main() {
    console.log('🚀 Starting CSS reference update for 2025 Design System...\n');
    
    const htmlFiles = await findHtmlFiles();
    console.log(`📁 Found ${htmlFiles.length} HTML files to check\n`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const file of htmlFiles) {
        const result = updateCssReferences(file);
        if (result === true) {
            updatedCount++;
        } else if (result === false && fs.existsSync(file)) {
            // File exists but wasn't updated (no old references found)
            console.log(`⏭️  Skipped: ${file} (no old CSS references found)`);
        } else {
            errorCount++;
        }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Files updated: ${updatedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`⏭️  Files skipped: ${htmlFiles.length - updatedCount - errorCount}`);
    
    if (updatedCount > 0) {
        console.log('\n🎉 CSS references successfully updated to use main-2025.css!');
        console.log('\n📋 Next steps:');
        console.log('1. Test the application to ensure all styles are working');
        console.log('2. Update service worker cache list if needed');
        console.log('3. Update any build scripts or configuration files');
    } else {
        console.log('\nℹ️  No files needed updating. All CSS references are already current.');
    }
}

// Run the script
main().catch(console.error);
