#!/usr/bin/env node

/**
 * Extension Test Runner
 *
 * Runs all extension tests (index.test.js files)
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const EXTENSIONS_OFFICIAL_DIR = path.join(ROOT_DIR, 'extensions-official');
const EXTENSIONS_UNOFFICIAL_DIR = path.join(ROOT_DIR, 'extensions-unofficial');
const BASE_FILE = path.join(ROOT_DIR, 'antinote-extensions-base-v0.0.1.js');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Get all extension directories
function getExtensionDirs(baseDir) {
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
      testPath: path.join(baseDir, name, 'index.test.js'),
      indexPath: path.join(baseDir, name, 'index.js')
    }));
}

// Run tests for a single extension
async function runExtensionTests(extension) {
  const { name, testPath, indexPath } = extension;

  if (!fs.existsSync(testPath)) {
    console.log(`  ⊘ ${name}: No test file`);
    return { success: true, skipped: true };
  }

  console.log(`  Running tests for ${name}...`);

  try {
    // Load extension metadata to get command names and dependencies
    const metadataPath = path.join(extension.path, 'extension.json');
    let commandNames = [];
    let dependencies = [];
    if (fs.existsSync(metadataPath)) {
      try {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        commandNames = (metadata.commands || []).map(cmd => cmd.name);
        dependencies = metadata.dependencies || [];
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

    // Helper: Load extension code (multi-file or single-file)
    const loadExtensionCode = (extDir, extName) => {
      const metaPath = path.join(extDir, extName, 'extension.json');
      let code = '';

      if (fs.existsSync(metaPath)) {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        if (meta.files && Array.isArray(meta.files)) {
          // Multi-file extension
          for (const file of meta.files) {
            const filePath = path.join(extDir, extName, file);
            if (fs.existsSync(filePath)) {
              code += fs.readFileSync(filePath, 'utf8') + '\n';
            }
          }
          return code;
        }
      }

      // Single-file extension (fallback)
      const indexPath = path.join(extDir, extName, 'index.js');
      if (fs.existsSync(indexPath)) {
        return fs.readFileSync(indexPath, 'utf8');
      }

      return '';
    };

    // Load dependency extensions
    let dependencyCode = '';
    for (const depName of dependencies) {
      // Try official first, then unofficial
      let code = loadExtensionCode(EXTENSIONS_OFFICIAL_DIR, depName);
      if (!code) {
        code = loadExtensionCode(EXTENSIONS_UNOFFICIAL_DIR, depName);
      }

      if (code) {
        dependencyCode += `\n      // Load dependency: ${depName}\n`;
        dependencyCode += `      ${code}\n`;
      }
    }

    // Generate variable declarations for each command
    // Sanitize command names to be valid JavaScript identifiers
    const commandDeclarations = commandNames.map(cmdName => {
      // Create a safe variable name by replacing special characters
      const safeName = cmdName.replace(/[^a-zA-Z0-9_]/g, '_');
      return `var ${safeName} = global.commandRegistry.find(function(c) { return c.name === "${cmdName}"; });`;
    }).join('\n      ');

    // Run the test file with Node.js
    // Load base file first, then extension code, then tests
    // Set __dirname to point to the extension directory so tests can find extension.json
    const testCode = `
      // Override __dirname to point to the extension directory
      var __dirname = ${JSON.stringify(extension.path)};

      ${fs.readFileSync(BASE_FILE, 'utf8')}

      // Mock runtime functions provided by Antinote app
      function getExtensionPreference(extensionName, key) {
        // Return null to use defaults in extension code
        return null;
      }

      function callAPI(apiKeyId, url, method, headers, body, timeout) {
        // Mock API call - return object with success and data properties
        // (not a ReturnObject - different format expected by ai_providers)
        return {
          success: true,
          data: JSON.stringify({
            choices: [{
              message: {
                content: "Mock AI response for testing"
              }
            }]
          })
        };
      }
${dependencyCode}
      // Expose global functions to local scope (for dependencies like ai_providers)
      if (typeof global.callAIProvider !== 'undefined') {
        var callAIProvider = global.callAIProvider;
      }

      // Load extension (multi-file or single-file)
      ${loadExtensionCode(path.dirname(extension.path), path.basename(extension.path))}

      // Expose commands from global registry to local scope for tests
      ${commandDeclarations}

      ${fs.readFileSync(testPath, 'utf8')}
    `;

    // Write temporary test file
    const tempFile = path.join(ROOT_DIR, `.temp-test-${name}.js`);
    fs.writeFileSync(tempFile, testCode);

    try {
      const { stdout, stderr } = await execPromise(`node "${tempFile}"`, {
        timeout: 10000 // 10 second timeout
      });

      // Clean up temp file
      fs.unlinkSync(tempFile);

      // Check output for test results
      const output = stdout + stderr;
      const hasFailures = output.includes('✗') || output.includes('Error:');

      if (hasFailures) {
        console.log(`    ✗ ${name}: Tests failed`);
        console.log(output);
        failedTests++;
        return { success: false, output };
      } else {
        console.log(`    ✓ ${name}: All tests passed`);
        passedTests++;
        return { success: true, output };
      }
    } catch (error) {
      // Clean up temp file on error
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      throw error;
    }
  } catch (error) {
    console.log(`    ✗ ${name}: Test execution failed`);
    console.log(`      Error: ${error.message}`);
    failedTests++;
    return { success: false, error: error.message };
  }
}

// Main test runner
async function main() {
  console.log('🧪 Running Extension Tests\n');
  console.log('='.repeat(50));

  const officialExtensions = getExtensionDirs(EXTENSIONS_OFFICIAL_DIR);
  const unofficialExtensions = getExtensionDirs(EXTENSIONS_UNOFFICIAL_DIR);
  const allExtensions = [...officialExtensions, ...unofficialExtensions];

  console.log(`\nFound ${allExtensions.length} extensions to test\n`);

  // Run tests for each extension
  for (const extension of allExtensions) {
    totalTests++;
    await runExtensionTests(extension);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Test Summary:`);
  console.log(`  Total extensions: ${totalTests}`);
  console.log(`  Passed: ${passedTests}`);
  console.log(`  Failed: ${failedTests}`);
  console.log(`  Skipped: ${totalTests - passedTests - failedTests}`);

  if (failedTests > 0) {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
  }

  console.log('\n✅ All tests passed!');
  process.exit(0);
}

// Run tests
main().catch(error => {
  console.error('\n❌ Test runner failed:', error);
  process.exit(1);
});
