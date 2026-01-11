#!/usr/bin/env node

/**
 * Batch replace hardcoded values with globals.css variables
 * This script replaces all hardcoded colors, spacing, fonts, etc. with CSS variables
 */

const fs = require('fs');
const path = require('path');

// Define all replacement mappings based on globals.css
const REPLACEMENTS = {
  // Colors - Exact hex matches
  colors: [
    // White & Pearl
    { from: '#ffffff', to: 'var(--color-white)', name: 'white' },
    { from: '#FFFFFF', to: 'var(--color-white)', name: 'white' },
    { from: '#F8F8F6', to: 'var(--color-pearl)', name: 'pearl' },
    { from: '#F0F0EC', to: 'var(--color-pearl-dark)', name: 'pearl-dark' },

    // Cool Gray Scale
    { from: '#F8F9FA', to: 'var(--color-gray-50)', name: 'gray-50' },
    { from: '#F1F3F5', to: 'var(--color-gray-100)', name: 'gray-100' },
    { from: '#E9ECEF', to: 'var(--color-gray-200)', name: 'gray-200' },
    { from: '#DEE2E6', to: 'var(--color-gray-300)', name: 'gray-300' },
    { from: '#ADB5BD', to: 'var(--color-gray-400)', name: 'gray-400' },
    { from: '#8E9AAF', to: 'var(--color-gray-500)', name: 'gray-500' },
    { from: '#6C757D', to: 'var(--color-gray-600)', name: 'gray-600' },
    { from: '#495057', to: 'var(--color-gray-700)', name: 'gray-700' },
    { from: '#343A40', to: 'var(--color-gray-800)', name: 'gray-800' },
    { from: '#212529', to: 'var(--color-gray-900)', name: 'gray-900' },

    // Primary (Spring Rain)
    { from: '#8FB996', to: 'var(--color-primary)', name: 'primary' },
    { from: '#7AAE82', to: 'var(--color-primary-hover)', name: 'primary-hover' },
    { from: '#E8F0EA', to: 'var(--color-primary-light)', name: 'primary-light' },
    { from: '#6A9B72', to: 'var(--color-primary-dark)', name: 'primary-dark' },

    // Secondary (Cool Gray Accent)
    { from: '#8E9AAF', to: 'var(--color-secondary)', name: 'secondary' },
    { from: '#7A8699', to: 'var(--color-secondary-hover)', name: 'secondary-hover' },
    { from: '#E9ECF0', to: 'var(--color-secondary-light)', name: 'secondary-light' },

    // Semantic Colors
    { from: '#E5C07B', to: 'var(--color-warning)', name: 'warning' },
    { from: '#FBF6EC', to: 'var(--color-warning-light)', name: 'warning-light' },
    { from: '#D4848C', to: 'var(--color-error)', name: 'error' },
    { from: '#F9ECEE', to: 'var(--color-error-light)', name: 'error-light' },

    // Chart/Custom colors that should map to semantic colors
    { from: '#3b82f6', to: 'var(--color-info)', name: 'info (was blue)' },
    { from: '#22c55e', to: 'var(--color-success)', name: 'success (was green)' },
    { from: '#f59e0b', to: 'var(--color-warning)', name: 'warning (was amber)' },
    { from: '#8b5cf6', to: 'var(--color-secondary)', name: 'secondary (was purple)' },
    { from: '#64748b', to: 'var(--color-gray-600)', name: 'gray-600 (was slate)' },

    // Derived colors (darker shades used in the codebase)
    { from: '#2F5E3D', to: 'var(--color-primary-dark)', name: 'primary-dark (darker green text)' },
    { from: '#B86B73', to: 'var(--color-error)', name: 'error (darker red text)' },

    // Tailwind default colors that need mapping
    { from: '#cbd5e1', to: 'var(--color-gray-300)', name: 'gray-300 (was slate-300)' },
  ],

  // Font sizes - we'll handle these in className replacements
  // Spacing - we'll handle these in className replacements
};

// Files to exclude
const EXCLUDE_FILES = [
  'src/app/globals.css',
  'src/app/test/globals.css',
];

let totalReplacements = 0;
let filesModified = 0;

function replaceInFile(filePath, content) {
  let modified = false;
  let newContent = content;
  let fileReplacements = 0;

  // Replace hex colors
  REPLACEMENTS.colors.forEach(({ from, to, name }) => {
    const regex = new RegExp(from, 'gi');
    const matches = (newContent.match(regex) || []).length;

    if (matches > 0) {
      newContent = newContent.replace(regex, to);
      fileReplacements += matches;
      modified = true;
      console.log(`  ✓ Replaced ${matches}x ${from} → ${to} (${name})`);
    }
  });

  if (modified) {
    totalReplacements += fileReplacements;
    filesModified++;
    console.log(`  📝 Total replacements in file: ${fileReplacements}`);
  }

  return { modified, newContent };
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      // Skip node_modules, .next, etc.
      if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      }
    } else {
      // Only include .tsx and .ts files, but not test files
      if ((filePath.endsWith('.tsx') || filePath.endsWith('.ts')) &&
          !filePath.includes('.test.') &&
          !filePath.includes('__tests__')) {
        arrayOfFiles.push(filePath);
      }
    }
  });

  return arrayOfFiles;
}

function main() {
  console.log('🚀 Starting batch replacement of hardcoded values...\n');
  console.log('📋 Searching for files...\n');

  // Find all files
  const srcPath = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcPath);

  const filesToProcess = files.filter(file => {
    const relativePath = path.relative(process.cwd(), file);
    return !EXCLUDE_FILES.includes(relativePath);
  });

  console.log(`Found ${filesToProcess.length} files to process\n`);
  console.log('=' .repeat(80) + '\n');

  // Process each file
  for (const filePath of filesToProcess) {
    const relativePath = path.relative(process.cwd(), filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    const { modified, newContent } = replaceInFile(filePath, content);

    if (modified) {
      console.log(`\n📄 ${relativePath}`);
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✨ Batch replacement complete!\n');
  console.log(`📊 Summary:`);
  console.log(`   - Files modified: ${filesModified}`);
  console.log(`   - Total replacements: ${totalReplacements}`);
  console.log(`   - Files scanned: ${filesToProcess.length}\n`);
}

try {
  main();
} catch (err) {
  console.error('❌ Error:', err);
  process.exit(1);
}
