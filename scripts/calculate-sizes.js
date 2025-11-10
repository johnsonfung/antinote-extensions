#!/usr/bin/env node

/**
 * Calculate and update extension sizes in extension.json
 *
 * This script:
 * 1. Reads all extension.json files
 * 2. Calculates total size based on files array (or index.js if single-file)
 * 3. Updates extension.json with size information
 */

const fs = require('fs');
const path = require('path');

const EXTENSIONS_DIR = path.join(__dirname, '../extensions-official');
const UNOFFICIAL_DIR = path.join(__dirname, '../extensions-unofficial');

function calculateExtensionSize(extensionDir) {
  const metadataPath = path.join(extensionDir, 'extension.json');

  if (!fs.existsSync(metadataPath)) {
    return null;
  }

  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  const extensionName = metadata.name;

  let totalSize = 0;
  const fileSizes = {};

  if (metadata.files && Array.isArray(metadata.files)) {
    // Multi-file extension
    console.log(`📦 ${extensionName} (multi-file)`);

    for (const file of metadata.files) {
      const filePath = path.join(extensionDir, file);

      if (!fs.existsSync(filePath)) {
        console.error(`  ❌ File not found: ${file}`);
        process.exit(1);
      }

      const stats = fs.statSync(filePath);
      fileSizes[file] = stats.size;
      totalSize += stats.size;

      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`  ├─ ${file} (${sizeKB} KB)`);
    }
  } else {
    // Single file extension
    console.log(`📄 ${extensionName} (single-file)`);

    const indexPath = path.join(extensionDir, 'index.js');

    if (!fs.existsSync(indexPath)) {
      console.error(`  ❌ index.js not found`);
      process.exit(1);
    }

    const stats = fs.statSync(indexPath);
    fileSizes['index.js'] = stats.size;
    totalSize = stats.size;

    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`  └─ index.js (${sizeKB} KB)`);
  }

  // Update metadata with size info
  const totalKB = Math.round(totalSize / 1024 * 10) / 10;
  metadata.size = {
    total: totalSize,
    totalKB: totalKB
  };

  console.log(`  📊 Total: ${totalKB} KB\n`);

  // Write updated metadata
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n');

  return metadata.size;
}

function processExtensionsDirectory(dir, label) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  ${label} directory not found: ${dir}\n`);
    return [];
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`${label}`);
  console.log(`${'='.repeat(50)}\n`);

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const extensions = entries.filter(entry => entry.isDirectory());
  const sizes = [];

  for (const extension of extensions) {
    const extensionDir = path.join(dir, extension.name);
    const size = calculateExtensionSize(extensionDir);
    if (size) {
      sizes.push({ name: extension.name, ...size });
    }
  }

  return sizes;
}

// Main execution
console.log('\n🔍 Calculating Extension Sizes\n');

const officialSizes = processExtensionsDirectory(EXTENSIONS_DIR, '📂 Official Extensions');
const unofficialSizes = processExtensionsDirectory(UNOFFICIAL_DIR, '📂 Unofficial Extensions');

// Summary
console.log(`${'='.repeat(50)}`);
console.log('📊 Summary');
console.log(`${'='.repeat(50)}\n`);

const allSizes = [...officialSizes, ...unofficialSizes];
const totalSize = allSizes.reduce((sum, ext) => sum + ext.total, 0);
const totalKB = (totalSize / 1024).toFixed(1);

console.log(`Total extensions: ${allSizes.length}`);
console.log(`Total size: ${totalKB} KB`);
console.log(`Average size: ${(totalSize / allSizes.length / 1024).toFixed(1)} KB`);

// Largest extensions
console.log('\n📈 Largest Extensions:');
allSizes.sort((a, b) => b.total - a.total);
allSizes.slice(0, 5).forEach((ext, i) => {
  console.log(`  ${i + 1}. ${ext.name}: ${ext.totalKB} KB`);
});

console.log('\n✅ Size calculation complete!\n');
