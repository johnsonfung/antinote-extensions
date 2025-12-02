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

// Cache for loaded extension metadata
const extensionMetadataCache = new Map();

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

// Utility: Load extension metadata (with caching)
function loadExtensionMetadata(extensionName, allExtensions) {
  // Check cache first
  if (extensionMetadataCache.has(extensionName)) {
    return extensionMetadataCache.get(extensionName);
  }

  // Find the extension
  const extension = allExtensions.find(ext => ext.name === extensionName);
  if (!extension) {
    return null;
  }

  // Load metadata
  try {
    const content = fs.readFileSync(extension.metadataPath, 'utf8');
    const metadata = JSON.parse(content);
    extensionMetadataCache.set(extensionName, metadata);
    return metadata;
  } catch (error) {
    return null;
  }
}

// Utility: Get all security disclosures for an extension (including inherited from dependencies)
function getInheritedSecurityDisclosures(metadata, extensionName, allExtensions, visited = new Set()) {
  // Prevent circular dependencies
  if (visited.has(extensionName)) {
    return { endpoints: [], requiredAPIKeys: [] };
  }
  visited.add(extensionName);

  const endpoints = new Set(metadata.endpoints || []);
  const requiredAPIKeys = new Set(metadata.requiredAPIKeys || []);

  // Recursively collect from dependencies
  if (metadata.dependencies && Array.isArray(metadata.dependencies)) {
    metadata.dependencies.forEach(depName => {
      const depMetadata = loadExtensionMetadata(depName, allExtensions);
      if (depMetadata) {
        const inherited = getInheritedSecurityDisclosures(depMetadata, depName, allExtensions, visited);
        inherited.endpoints.forEach(e => endpoints.add(e));
        inherited.requiredAPIKeys.forEach(k => requiredAPIKeys.add(k));
      }
    });
  }

  return {
    endpoints: Array.from(endpoints),
    requiredAPIKeys: Array.from(requiredAPIKeys)
  };
}

// Validation: Check extension.json structure
function validateMetadata(extension, allExtensions) {
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

  // Cache the metadata
  extensionMetadataCache.set(name, metadata);

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

  // Validate commands (allow service extensions to have zero commands)
  if (!Array.isArray(metadata.commands)) {
    errors.push(`[${name}] commands must be an array`);
  } else if (metadata.commands.length === 0 && !metadata.isService) {
    errors.push(`[${name}] Must have at least one command (unless isService is true)`);
  } else {
    metadata.commands.forEach((cmd, index) => {
      if (!cmd.name) {
        errors.push(`[${name}] Command ${index} missing name`);
      } else {
        // Validate command naming: must be snake_case (lowercase letters, numbers, and underscores only)
        const validNamePattern = /^[a-z0-9_]+$/;
        if (!validNamePattern.test(cmd.name)) {
          errors.push(`[${name}] Command "${cmd.name}" must use snake_case (lowercase letters, numbers, and underscores only). Do not include symbols like :: in the command name - those should be added as aliases.`);
        }
      }
      if (!cmd.description) {
        warnings.push(`[${name}] Command ${cmd.name || index} missing description`);
      }
      if (cmd.type && !VALID_COMMAND_TYPES.includes(cmd.type)) {
        errors.push(`[${name}] Command ${cmd.name} has invalid type: ${cmd.type}`);
      }
    });
  }

  // Validate dependencies exist
  if (metadata.dependencies && Array.isArray(metadata.dependencies)) {
    metadata.dependencies.forEach(depName => {
      const depMetadata = loadExtensionMetadata(depName, allExtensions);
      if (!depMetadata) {
        errors.push(`[${name}] Declares dependency on "${depName}" but that extension was not found`);
      }
    });
  }

  // Validate multi-file support
  if (metadata.files) {
    if (!Array.isArray(metadata.files)) {
      errors.push(`[${name}] files must be an array`);
    } else if (metadata.files.length === 0) {
      errors.push(`[${name}] files array cannot be empty (omit field for single-file extension)`);
    } else {
      // Check that index.js is first
      if (metadata.files[0] !== 'index.js') {
        errors.push(`[${name}] index.js must be the first file in the files array`);
      }

      // Check that all declared files exist
      metadata.files.forEach((file, idx) => {
        const filePath = path.join(extension.path, file);
        if (!fs.existsSync(filePath)) {
          errors.push(`[${name}] Declared file not found: ${file}`);
        }

        // Validate file naming for official extensions (enforce structure for PRs)
        if (isOfficial && idx > 0) { // Skip index.js
          // Check if file follows recommended structure
          const hasValidPath = /^(helpers|commands|utils)\//.test(file);
          if (!hasValidPath) {
            warnings.push(`[${name}] File "${file}" should be in helpers/, commands/, or utils/ folder for consistency`);
          }
        }
      });

      // Check for .js files not declared in files array
      const findJsFiles = (dir) => {
        const files = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            files.push(...findJsFiles(fullPath));
          } else if (entry.name.endsWith('.js') && entry.name !== 'index.test.js') {
            const relativePath = path.relative(extension.path, fullPath);
            files.push(relativePath);
          }
        }
        return files;
      };

      const allJsFiles = findJsFiles(extension.path);
      allJsFiles.forEach(file => {
        if (!metadata.files.includes(file)) {
          warnings.push(`[${name}] JavaScript file "${file}" exists but not declared in files array`);
        }
      });
    }
  }

  return metadata;
}

// Validation: Check code for security disclosures (all files)
function validateCodeDisclosures(extension, metadata, allExtensions) {
  const { indexPath, name } = extension;

  // Read all extension code files
  let code = '';
  if (metadata.files && Array.isArray(metadata.files)) {
    // Multi-file extension - read all files
    for (const file of metadata.files) {
      const filePath = path.join(extension.path, file);
      if (fs.existsSync(filePath)) {
        code += fs.readFileSync(filePath, 'utf8') + '\n';
      }
    }
  } else {
    // Single-file extension
    if (!validateFileExists(extension, indexPath, 'index.js')) {
      return;
    }
    code = fs.readFileSync(indexPath, 'utf8');
  }

  // Get inherited security disclosures from dependencies
  const inherited = getInheritedSecurityDisclosures(metadata, name, allExtensions);
  const allEndpoints = inherited.endpoints;
  const allAPIKeys = inherited.requiredAPIKeys;

  // Check if extension has dependencies - if so, it should inherit security disclosures
  if (metadata.dependencies && metadata.dependencies.length > 0) {
    // Extensions with dependencies should typically have empty or minimal own disclosures
    if (metadata.endpoints.length > 0 || metadata.requiredAPIKeys.length > 0) {
      warnings.push(`[${name}] Has dependencies but also declares own endpoints/API keys. Consider if these are truly needed or if they're inherited from dependencies.`);
    }
  }

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

  // Check if code makes HTTP calls but doesn't declare endpoints (including inherited)
  const httpCallMatch = code.match(/https?:\/\/[^\s"']+/g);
  if (httpCallMatch) {
    const foundEndpoints = [...new Set(httpCallMatch.map(url => {
      const match = url.match(/https?:\/\/[^/\s"']+/);
      return match ? match[0] : null;
    }).filter(Boolean))];

    foundEndpoints.forEach(foundEndpoint => {
      // Skip if this URL appears only in headers (like HTTP-Referer)
      const isHeaderOnly = code.includes(`"HTTP-Referer": "${foundEndpoint}"`) ||
                           code.includes(`'HTTP-Referer': '${foundEndpoint}'`) ||
                           code.includes(`"Referer": "${foundEndpoint}"`) ||
                           code.includes(`'Referer': '${foundEndpoint}'`) ||
                           code.includes(`["HTTP-Referer"] = "${foundEndpoint}"`) ||
                           code.includes(`['HTTP-Referer'] = '${foundEndpoint}'`) ||
                           code.includes(`["Referer"] = "${foundEndpoint}"`) ||
                           code.includes(`['Referer'] = '${foundEndpoint}'`);

      if (isHeaderOnly) {
        return; // Skip referer headers
      }

      // Skip if this URL is used in an openURL command (check if URL is in a command with type: "openURL")
      const isOpenURLCommand = metadata.commands && metadata.commands.some(cmd =>
        cmd.type === 'openURL' && code.includes(foundEndpoint)
      );

      if (isOpenURLCommand) {
        return; // Skip URLs used in openURL commands (they're returned as payload, not called)
      }

      // Check if this endpoint is declared (either directly or inherited)
      const isDeclared = allEndpoints.some(declared => {
        const declaredDomain = declared.replace(/^https?:\/\//, '').split('/')[0];
        const foundDomain = foundEndpoint.replace(/^https?:\/\//, '').split('/')[0];
        return declaredDomain === foundDomain;
      });

      if (!isDeclared) {
        errors.push(`[${name}] Makes HTTP calls to ${foundEndpoint} but it's not declared in endpoints (including inherited from dependencies)`);
      }
    });
  }

  // Check if extension uses API keys (check both own and inherited)
  if (metadata.requiredAPIKeys.length > 0) {
    metadata.requiredAPIKeys.forEach(keyName => {
      if (!code.includes(keyName)) {
        warnings.push(`[${name}] Declares API key "${keyName}" but not found in code`);
      }
    });
  }

  // Check for undeclared API key usage (must be declared or inherited)
  const apiKeyPatterns = [
    /getAPIKey\(['"]([^'"]+)['"]\)/g,
    /apikey_\w+/gi,
    /callAPI\(\s*['"]([^'"]*)['"]/g
  ];

  apiKeyPatterns.forEach(pattern => {
    const matches = code.matchAll(pattern);
    for (const match of matches) {
      const keyName = match[1] || match[0];
      // Skip empty strings
      if (!keyName || keyName.trim() === '') continue;

      // Check if key is declared (own or inherited)
      if (!allAPIKeys.includes(keyName) && keyName.startsWith('apikey_')) {
        errors.push(`[${name}] Uses API key "${keyName}" but it's not declared in requiredAPIKeys (including inherited from dependencies)`);
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

// Validation: Check that version in index.js matches extension.json
function validateVersionSync(extension, metadata) {
  const { name } = extension;

  if (!metadata || !metadata.version) {
    return; // Already reported as missing required field
  }

  // Read all extension code files to find version
  let code = '';
  if (metadata.files && Array.isArray(metadata.files)) {
    // Multi-file extension - read index.js (first file)
    const indexPath = path.join(extension.path, metadata.files[0]);
    if (fs.existsSync(indexPath)) {
      code = fs.readFileSync(indexPath, 'utf8');
    }
  } else {
    // Single-file extension
    if (fs.existsSync(extension.indexPath)) {
      code = fs.readFileSync(extension.indexPath, 'utf8');
    }
  }

  if (!code) {
    return; // No code to check
  }

  // Look for version in Extension constructor
  // Patterns to match:
  //   version: "1.0.0"
  //   version: '1.0.0'
  const versionPatterns = [
    /new\s+Extension\s*\(\s*\{[^}]*version\s*:\s*["']([^"']+)["']/s,
    /version\s*:\s*["']([^"']+)["']/
  ];

  let jsVersion = null;
  for (const pattern of versionPatterns) {
    const match = code.match(pattern);
    if (match) {
      jsVersion = match[1];
      break;
    }
  }

  if (!jsVersion) {
    warnings.push(`[${name}] Could not find version in index.js to verify sync with extension.json`);
    return;
  }

  if (jsVersion !== metadata.version) {
    errors.push(`[${name}] Version mismatch: extension.json has "${metadata.version}" but index.js has "${jsVersion}"`);
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
function validateExtension(extension, allExtensions) {
  console.log(`\nValidating ${extension.name}...`);

  const metadata = validateMetadata(extension, allExtensions);
  if (metadata) {
    validateCodeDisclosures(extension, metadata, allExtensions);
    validateVersionSync(extension, metadata);
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
  allExtensions.forEach(ext => validateExtension(ext, allExtensions));

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
