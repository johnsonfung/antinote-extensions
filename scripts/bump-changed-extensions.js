#!/usr/bin/env node

/**
 * Auto-bump Extension Versions Script
 *
 * This script automatically increments the version number of extensions
 * that have been modified since the last commit.
 *
 * It detects changes using git and bumps the patch version for any
 * extension with modified files.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const EXTENSIONS_OFFICIAL_DIR = path.join(ROOT_DIR, 'extensions-official');
const EXTENSIONS_UNOFFICIAL_DIR = path.join(ROOT_DIR, 'extensions-unofficial');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Get list of changed files since last commit
 */
function getChangedFiles() {
  try {
    // Get files changed in the working directory (staged and unstaged)
    const staged = execSync('git diff --name-only --cached', { encoding: 'utf8', cwd: ROOT_DIR }).trim();
    const unstaged = execSync('git diff --name-only', { encoding: 'utf8', cwd: ROOT_DIR }).trim();

    const allChanges = [...staged.split('\n'), ...unstaged.split('\n')]
      .filter(file => file.length > 0);

    return [...new Set(allChanges)]; // Remove duplicates
  } catch (error) {
    console.error('Error getting changed files:', error.message);
    return [];
  }
}

/**
 * Extract extension name from file path
 */
function getExtensionNameFromPath(filePath) {
  // Match patterns like: extensions-official/templates/...
  const match = filePath.match(/^extensions-(official|unofficial)\/([^\/]+)\//);
  if (match) {
    return {
      name: match[2],
      isOfficial: match[1] === 'official'
    };
  }
  return null;
}

/**
 * Get all changed extensions
 */
function getChangedExtensions() {
  const changedFiles = getChangedFiles();
  const extensions = new Map(); // Use Map to avoid duplicates

  for (const file of changedFiles) {
    const extInfo = getExtensionNameFromPath(file);
    if (extInfo) {
      const baseDir = extInfo.isOfficial ? EXTENSIONS_OFFICIAL_DIR : EXTENSIONS_UNOFFICIAL_DIR;
      const extPath = path.join(baseDir, extInfo.name);
      const metadataPath = path.join(extPath, 'extension.json');

      if (fs.existsSync(metadataPath)) {
        extensions.set(extInfo.name, {
          name: extInfo.name,
          path: extPath,
          metadataPath,
          isOfficial: extInfo.isOfficial,
          changedFiles: extensions.has(extInfo.name)
            ? [...extensions.get(extInfo.name).changedFiles, file]
            : [file]
        });
      }
    }
  }

  return Array.from(extensions.values());
}

/**
 * Parse semantic version string
 */
function parseVersion(versionString) {
  const parts = versionString.split('.').map(Number);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0
  };
}

/**
 * Bump patch version
 */
function bumpPatchVersion(versionString) {
  const version = parseVersion(versionString);
  return `${version.major}.${version.minor}.${version.patch + 1}`;
}

/**
 * Update extension version in extension.json
 */
function updateExtensionVersion(extensionInfo) {
  const { name, metadataPath } = extensionInfo;

  try {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const oldVersion = metadata.version || '1.0.0';
    const newVersion = bumpPatchVersion(oldVersion);

    metadata.version = newVersion;

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n');

    return { oldVersion, newVersion };
  } catch (error) {
    console.error(`  ${colors.red}✗${colors.reset} Failed to update ${name}:`, error.message);
    return null;
  }
}

/**
 * Main function
 */
function main() {
  console.log(`${colors.cyan}🔄 Auto-bumping versions for changed extensions...${colors.reset}\n`);

  const changedExtensions = getChangedExtensions();

  if (changedExtensions.length === 0) {
    console.log(`${colors.yellow}ℹ No extension changes detected${colors.reset}`);
    console.log('  All extensions are up to date\n');
    return;
  }

  console.log(`${colors.blue}Found ${changedExtensions.length} changed extension(s):${colors.reset}`);

  let bumpedCount = 0;

  for (const extInfo of changedExtensions) {
    const result = updateExtensionVersion(extInfo);

    if (result) {
      console.log(`  ${colors.green}✓${colors.reset} ${extInfo.name}: ${result.oldVersion} → ${result.newVersion}`);
      console.log(`    ${colors.yellow}Changed files:${colors.reset}`);
      extInfo.changedFiles.forEach(file => {
        console.log(`      - ${file}`);
      });
      bumpedCount++;
    }
  }

  console.log(`\n${colors.green}✅ Bumped ${bumpedCount} extension version(s)${colors.reset}\n`);
}

// Run the script
main();
