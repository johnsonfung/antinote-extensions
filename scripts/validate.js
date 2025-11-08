#!/usr/bin/env node

/**
 * Extension Validation Script
 *
 * This script validates all extensions to ensure they:
 * 1. Have all required metadata fields
 * 2. Properly disclose API keys and endpoints
 * 3. Match their official/unofficial folder location
 * 4. Have valid extension.json structure
 * 5. Follow naming conventions
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const EXTENSIONS_OFFICIAL_DIR = path.join(ROOT_DIR, 'extensions-official');
const EXTENSIONS_UNOFFICIAL_DIR = path.join(ROOT_DIR, 'extensions-unofficial');

// Required fields in extension.json
const REQUIRED_FIELDS = [
  'name',
  'version',
  'author',
  'description',
  'license',
  'category',
  'dataScope',
  'endpoints',
  'requiredAPIKeys',
  'official',
  'commands'
];

const REQUIRED_OFFICIAL_FIELDS = ['includedByDefault'];

// Valid data scopes
const VALID_DATA_SCOPES = ['none', 'line', 'full'];

// Valid command types
const VALID_COMMAND_TYPES = ['insert', 'replaceLine', 'replaceAll', 'openURL'];

let errors = [];
let warnings = [];
let extensionsChecked = 0;

// Utility: Get all extension directories
function getExtensionDirs(baseDir, isOfficial) {
  if (!fs.existsSync(baseDir)) {
    return [];
  }

  return fs.readdirSync(baseDir)
    .filter(name => {
      const fullPath = path.join(baseDir, name);
      return fs.statSync(fullPath).isDirectory();
    })
    .map(name => ({
      name,
      path: path.join(baseDir, name),
      metadataPath: path.join(baseDir, name, 'extension.json'),
      indexPath: path.join(baseDir, name, 'index.js'),
      testPath: path.join(baseDir, name, 'index.test.js'),
      readmePath: path.join(baseDir, name, 'README.md'),
      isOfficial
    }));
}

// Validation: Check if file exists
function validateFileExists(extension, filePath, fileName) {
  if (!fs.existsSync(filePath)) {
    errors.push(`[${extension.name}] Missing ${fileName}`);
    return false;
  }
  return true;
}

// Validation: Check extension.json structure
function validateMetadata(extension) {
  const { metadataPath, name, isOfficial } = extension;

  if (!validateFileExists(extension, metadataPath, 'extension.json')) {
    return;
  }

  let metadata;
  try {
    const content = fs.readFileSync(metadataPath, 'utf8');
    metadata = JSON.parse(content);
  } catch (error) {
    errors.push(`[${name}] Invalid JSON in extension.json: ${error.message}`);
    return;
  }

  // Check required fields
  const requiredFields = isOfficial
    ? [...REQUIRED_FIELDS, ...REQUIRED_OFFICIAL_FIELDS]
    : REQUIRED_FIELDS;

  requiredFields.forEach(field => {
    if (!(field in metadata)) {
      errors.push(`[${name}] Missing required field: ${field}`);
    }
  });

  // Validate specific fields
  if (metadata.name && metadata.name !== name) {
    errors.push(`[${name}] Metadata name "${metadata.name}" doesn't match folder name "${name}"`);
  }

  if (metadata.official !== isOfficial) {
    errors.push(`[${name}] official field is ${metadata.official} but extension is in ${isOfficial ? 'official' : 'unofficial'} folder`);
  }

  if (!isOfficial && 'includedByDefault' in metadata) {
    errors.push(`[${name}] Unofficial extensions should not have includedByDefault field`);
  }

  if (metadata.dataScope && !VALID_DATA_SCOPES.includes(metadata.dataScope)) {
    errors.push(`[${name}] Invalid dataScope: ${metadata.dataScope}. Must be one of: ${VALID_DATA_SCOPES.join(', ')}`);
  }

  // Validate endpoints array
  if (!Array.isArray(metadata.endpoints)) {
    errors.push(`[${name}] endpoints must be an array`);
  }

  // Validate requiredAPIKeys array
  if (!Array.isArray(metadata.requiredAPIKeys)) {
    errors.push(`[${name}] requiredAPIKeys must be an array`);
  }

  // Validate commands
  if (!Array.isArray(metadata.commands) || metadata.commands.length === 0) {
    errors.push(`[${name}] Must have at least one command`);
  } else {
    metadata.commands.forEach((cmd, index) => {
      if (!cmd.name) {
        errors.push(`[${name}] Command ${index} missing name`);
      }
      if (!cmd.description) {
        warnings.push(`[${name}] Command ${cmd.name || index} missing description`);
      }
      if (cmd.type && !VALID_COMMAND_TYPES.includes(cmd.type)) {
        errors.push(`[${name}] Command ${cmd.name} has invalid type: ${cmd.type}`);
      }
    });
  }

  return metadata;
}

// Validation: Check index.js code for security disclosures
function validateCodeDisclosures(extension, metadata) {
  const { indexPath, name } = extension;

  if (!validateFileExists(extension, indexPath, 'index.js')) {
    return;
  }

  const code = fs.readFileSync(indexPath, 'utf8');

  // Check if extension declares endpoints but doesn't make calls
  if (metadata.endpoints && metadata.endpoints.length > 0) {
    // Look for common HTTP client patterns
    const hasHttpCalls = /fetch\(|XMLHttpRequest|callAPI\(/.test(code);
    if (!hasHttpCalls) {
      warnings.push(`[${name}] Declares endpoints ${metadata.endpoints.join(', ')} but no HTTP calls found in code`);
    }

    // Check if declared endpoints appear in code
    metadata.endpoints.forEach(endpoint => {
      const domain = endpoint.replace(/^https?:\/\//, '').split('/')[0];
      if (!code.includes(domain)) {
        warnings.push(`[${name}] Endpoint ${endpoint} declared but not found in code`);
      }
    });
  }

  // Check if code makes HTTP calls but doesn't declare endpoints
  if (metadata.endpoints.length === 0) {
    const httpCallMatch = code.match(/https?:\/\/[^\s"']+/g);
    if (httpCallMatch) {
      const foundEndpoints = [...new Set(httpCallMatch.map(url => {
        const match = url.match(/https?:\/\/[^/\s"']+/);
        return match ? match[0] : null;
      }).filter(Boolean))];

      if (foundEndpoints.length > 0) {
        errors.push(`[${name}] Makes HTTP calls to ${foundEndpoints.join(', ')} but endpoints array is empty`);
      }
    }
  }

  // Check if extension uses API keys
  if (metadata.requiredAPIKeys.length > 0) {
    metadata.requiredAPIKeys.forEach(keyName => {
      if (!code.includes(keyName)) {
        warnings.push(`[${name}] Declares API key "${keyName}" but not found in code`);
      }
    });
  }

  // Check for undeclared API key usage
  const apiKeyPatterns = [
    /getAPIKey\(['"]([^'"]+)['"]\)/g,
    /apikey_\w+/gi
  ];

  apiKeyPatterns.forEach(pattern => {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      const keyName = match[1] || match[0];
      if (!metadata.requiredAPIKeys.includes(keyName)) {
        errors.push(`[${name}] Uses API key "${keyName}" but not declared in requiredAPIKeys`);
      }
    }
  });

  // Check data scope accuracy
  if (metadata.dataScope === 'none') {
    if (code.includes('payload.fullText') || code.includes('fullText')) {
      warnings.push(`[${name}] dataScope is "none" but code accesses fullText`);
    }
  }
}

// Validation: Check for test file
function validateTests(extension) {
  const { testPath, name } = extension;

  if (!fs.existsSync(testPath)) {
    warnings.push(`[${name}] Missing test file (index.test.js)`);
    return;
  }

  const testContent = fs.readFileSync(testPath, 'utf8');

  // Check if test file has actual tests
  if (!testContent.includes('describe(') && !testContent.includes('it(')) {
    warnings.push(`[${name}] Test file exists but contains no tests`);
  }
}

// Validation: Check for README
function validateReadme(extension) {
  const { readmePath, name } = extension;

  if (!fs.existsSync(readmePath)) {
    warnings.push(`[${name}] Missing README.md`);
  }
}

// Validate single extension
function validateExtension(extension) {
  console.log(`\nValidating ${extension.name}...`);

  const metadata = validateMetadata(extension);
  if (metadata) {
    validateCodeDisclosures(extension, metadata);
  }
  validateTests(extension);
  validateReadme(extension);

  extensionsChecked++;
}

// Main validation
function main() {
  console.log('🔍 Starting Extension Validation\n');
  console.log('='.repeat(50));

  const officialExtensions = getExtensionDirs(EXTENSIONS_OFFICIAL_DIR, true);
  const unofficialExtensions = getExtensionDirs(EXTENSIONS_UNOFFICIAL_DIR, false);
  const allExtensions = [...officialExtensions, ...unofficialExtensions];

  console.log(`\nFound ${officialExtensions.length} official extensions`);
  console.log(`Found ${unofficialExtensions.length} unofficial extensions`);

  // Validate each extension
  allExtensions.forEach(validateExtension);

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Validation Summary:`);
  console.log(`  Extensions checked: ${extensionsChecked}`);
  console.log(`  Errors: ${errors.length}`);
  console.log(`  Warnings: ${warnings.length}`);

  // Print errors
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(error => console.log(`  ${error}`));
  }

  // Print warnings
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(warning => console.log(`  ${warning}`));
  }

  // Exit with error if there are errors
  if (errors.length > 0) {
    console.log('\n❌ Validation failed!');
    process.exit(1);
  }

  console.log('\n✅ Validation passed!');
  process.exit(0);
}

// Run validation
main();
