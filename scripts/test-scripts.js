#!/usr/bin/env node

/**
 * Test Script for Build Scripts
 *
 * Tests the bump-changed-extensions.js and validate.js scripts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const EXTENSIONS_OFFICIAL_DIR = path.join(ROOT_DIR, 'extensions-official');
const TEST_EXTENSION_DIR = path.join(EXTENSIONS_OFFICIAL_DIR, 'test_bump_script');

// Test results
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Test helper to create a test extension
 */
function createTestExtension(extensionName = 'test_bump_script') {
  const TEST_EXTENSION_DIR = path.join(EXTENSIONS_OFFICIAL_DIR, extensionName);

  // Clean up if exists
  if (fs.existsSync(TEST_EXTENSION_DIR)) {
    fs.rmSync(TEST_EXTENSION_DIR, { recursive: true });
  }

  fs.mkdirSync(TEST_EXTENSION_DIR, { recursive: true });

  // Create extension.json
  const metadata = {
    name: extensionName,
    version: '1.0.0',
    author: 'test',
    description: 'Test extension for bump script',
    license: 'MIT',
    category: 'Test',
    dataScope: 'none',
    endpoints: [],
    requiredAPIKeys: [],
    commands: [
      {
        name: 'test_command',
        description: 'Test command',
        type: 'insert'
      }
    ],
    official: true,
    includedByDefault: false
  };

  fs.writeFileSync(
    path.join(TEST_EXTENSION_DIR, 'extension.json'),
    JSON.stringify(metadata, null, 2) + '\n'
  );

  // Create index.js with valid command
  const indexContent = `
(function() {
  var extensionRoot = new Extension("${extensionName}", "1.0.0");

  var test_command = new Command(
    "test_command",
    [],
    "insert",
    "Test command",
    [],
    extensionRoot
  );

  test_command.execute = function(payload) {
    return new ReturnObject("success", "Test successful", "Test content");
  };
})();
  `.trim();

  fs.writeFileSync(
    path.join(TEST_EXTENSION_DIR, 'index.js'),
    indexContent + '\n'
  );

  // Create README.md
  fs.writeFileSync(
    path.join(TEST_EXTENSION_DIR, 'README.md'),
    '# Test Extension\n\nTest extension for automated testing.\n'
  );

  // Create test file to avoid validation warnings
  fs.writeFileSync(
    path.join(TEST_EXTENSION_DIR, 'index.test.js'),
    `// No tests\nconsole.log("✓ ${extensionName}: No tests defined");\n`
  );
}

/**
 * Test helper to clean up test extension
 */
function cleanupTestExtension(extensionName = 'test_bump_script') {
  const TEST_EXTENSION_DIR = path.join(EXTENSIONS_OFFICIAL_DIR, extensionName);
  const gitPath = `extensions-official/${extensionName}`;

  // Remove from git if it exists in the index
  try {
    execSync(`git rm -rf ${gitPath}`, { cwd: ROOT_DIR, stdio: 'pipe' });
  } catch (error) {
    // Ignore errors if not in git
  }

  // Remove from disk if it exists
  if (fs.existsSync(TEST_EXTENSION_DIR)) {
    fs.rmSync(TEST_EXTENSION_DIR, { recursive: true });
  }

  // Reset any uncommitted git changes related to the test extension
  try {
    execSync(`git reset HEAD ${gitPath} 2>/dev/null`, { cwd: ROOT_DIR, stdio: 'pipe' });
  } catch (error) {
    // Ignore errors
  }

  // Clean up any untracked files
  try {
    execSync(`git clean -fd ${gitPath} 2>/dev/null`, { cwd: ROOT_DIR, stdio: 'pipe' });
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Test helper to commit test extension
 */
function commitTestExtension(extensionName = 'test_bump_script') {
  try {
    execSync(`git add extensions-official/${extensionName}`, { cwd: ROOT_DIR, stdio: 'pipe' });
    execSync('git commit -m "Test: Add test extension" --no-verify', { cwd: ROOT_DIR, stdio: 'pipe' });
    // Small delay to ensure git commits are finalized
    execSync('sleep 0.1', { cwd: ROOT_DIR, stdio: 'pipe' });
  } catch (error) {
    // Check if it's because there's nothing to commit (already committed)
    try {
      const status = execSync(`git status --porcelain extensions-official/${extensionName}`, {
        cwd: ROOT_DIR,
        encoding: 'utf8'
      }).trim();
      if (status) {
        // There are uncommitted changes, this is an actual error
        throw error;
      }
      // No changes, already committed - this is fine
    } catch (statusError) {
      // Could not check status, throw original error
      throw error;
    }
  }
}

/**
 * Test helper to get extension version
 */
function getExtensionVersion(extensionName = 'test_bump_script') {
  const TEST_EXTENSION_DIR = path.join(EXTENSIONS_OFFICIAL_DIR, extensionName);
  const metadataPath = path.join(TEST_EXTENSION_DIR, 'extension.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  return metadata.version;
}

/**
 * Test helper to set extension version
 */
function setExtensionVersion(extensionName, version) {
  const TEST_EXTENSION_DIR = path.join(EXTENSIONS_OFFICIAL_DIR, extensionName);
  const metadataPath = path.join(TEST_EXTENSION_DIR, 'extension.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  metadata.version = version;
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n');
}

/**
 * Test helper to modify extension file
 */
function modifyExtensionFile(extensionName = 'test_bump_script') {
  const TEST_EXTENSION_DIR = path.join(EXTENSIONS_OFFICIAL_DIR, extensionName);
  const indexPath = path.join(TEST_EXTENSION_DIR, 'index.js');
  const content = fs.readFileSync(indexPath, 'utf8');
  fs.writeFileSync(indexPath, content + '// Modified\n');
}

/**
 * Run a test
 */
function test(name, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`  ${colors.green}✓${colors.reset} ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`  ${colors.red}✗${colors.reset} ${name}`);
    console.log(`    ${colors.red}Error: ${error.message}${colors.reset}`);
    failedTests++;
  }
}

/**
 * Assert helper
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * Test Suite: bump-changed-extensions.js
 */
function testBumpScript() {
  console.log(`\n${colors.cyan}Testing bump-changed-extensions.js${colors.reset}`);

  // Test 1: Auto-bump when file changed and version not changed
  test('Auto-bumps version when file changed without manual version bump', () => {
    const extName = 'test_bump_1';
    cleanupTestExtension(extName);
    createTestExtension(extName);
    commitTestExtension(extName);

    // Modify the extension (this creates unstaged changes that git diff will detect)
    modifyExtensionFile(extName);

    // Verify the file was actually modified
    const indexPath = path.join(EXTENSIONS_OFFICIAL_DIR, extName, 'index.js');
    const content = fs.readFileSync(indexPath, 'utf8');
    assert(content.includes('// Modified'), 'File should be modified');

    // Run bump script (it should detect the unstaged changes)
    const output = execSync('node scripts/bump-changed-extensions.js', { cwd: ROOT_DIR, encoding: 'utf8' });

    // Check version was bumped
    const version = getExtensionVersion(extName);
    assert(version === '1.0.1', `Expected version 1.0.1, got ${version}. Output: ${output}`);

    cleanupTestExtension(extName);
  });

  // Test 2: Skip when version manually changed
  test('Skips auto-bump when version was manually changed', () => {
    const extName = 'test_bump_2';
    cleanupTestExtension(extName);
    createTestExtension(extName);
    commitTestExtension(extName);

    // Manually bump version
    setExtensionVersion(extName, '1.1.0');

    // Modify another file
    modifyExtensionFile(extName);

    // Run bump script
    execSync('node scripts/bump-changed-extensions.js', { cwd: ROOT_DIR, stdio: 'pipe' });

    // Check version was NOT auto-bumped (should still be 1.1.0)
    const version = getExtensionVersion(extName);
    assert(version === '1.1.0', `Expected version 1.1.0, got ${version}`);

    cleanupTestExtension(extName);
  });

  // Test 3: No changes means no bump
  test('Does not bump version when no changes detected', () => {
    const extName = 'test_bump_3';
    cleanupTestExtension(extName);
    createTestExtension(extName);
    commitTestExtension(extName);

    // Don't modify anything - no unstaged changes should exist

    // Verify no changes exist
    try {
      const diffOutput = execSync(`git diff extensions-official/${extName}`, { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
      assert(diffOutput === '', 'Should have no diff output');
    } catch (error) {
      // OK if git diff fails
    }

    // Run bump script
    const output = execSync('node scripts/bump-changed-extensions.js', { cwd: ROOT_DIR, encoding: 'utf8' });

    // Check output indicates no changes
    assert(output.includes('No extension changes detected'), `Should report no changes. Output: ${output}`);

    cleanupTestExtension(extName);
  });

  // Test 4: Bump multiple versions correctly
  test('Correctly increments patch version', () => {
    const extName = 'test_bump_4';
    cleanupTestExtension(extName);
    createTestExtension(extName);
    setExtensionVersion(extName, '2.5.9');
    commitTestExtension(extName);

    // Modify the extension
    modifyExtensionFile(extName);

    // Run bump script
    execSync('node scripts/bump-changed-extensions.js', { cwd: ROOT_DIR, stdio: 'pipe' });

    // Check version was bumped correctly
    const version = getExtensionVersion(extName);
    assert(version === '2.5.10', `Expected version 2.5.10, got ${version}`);

    cleanupTestExtension(extName);
  });
}

/**
 * Test Suite: validate.js
 */
function testValidateScript() {
  console.log(`\n${colors.cyan}Testing validate.js${colors.reset}`);

  // Test 1: Valid extension passes validation
  test('Validates a correct extension structure', () => {
    const extName = 'test_validate_1';
    cleanupTestExtension(extName);
    createTestExtension(extName);

    try {
      execSync('node scripts/validate.js', { cwd: ROOT_DIR, stdio: 'pipe' });
      // If no error thrown, validation passed
    } catch (error) {
      // Check if it's a validation error or just the test extension
      // We expect validation to pass for our test extension
      throw new Error('Validation should pass for valid extension');
    } finally {
      cleanupTestExtension(extName);
    }
  });

  // Test 2: Missing required field fails validation
  test('Fails validation when required field is missing', () => {
    const extName = 'test_validate_2';
    cleanupTestExtension(extName);
    createTestExtension(extName);

    // Remove required field
    const metadataPath = path.join(EXTENSIONS_OFFICIAL_DIR, extName, 'extension.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    delete metadata.version;
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n');

    let validationFailed = false;
    try {
      execSync('node scripts/validate.js', { cwd: ROOT_DIR, stdio: 'pipe' });
    } catch (error) {
      validationFailed = true;
    }

    assert(validationFailed, 'Validation should fail for missing version field');
    cleanupTestExtension(extName);
  });

  // Test 3: Invalid dataScope fails validation
  test('Fails validation for invalid dataScope value', () => {
    const extName = 'test_validate_3';
    cleanupTestExtension(extName);
    createTestExtension(extName);

    // Set invalid dataScope
    const metadataPath = path.join(EXTENSIONS_OFFICIAL_DIR, extName, 'extension.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    metadata.dataScope = 'invalid';
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n');

    let validationFailed = false;
    try {
      execSync('node scripts/validate.js', { cwd: ROOT_DIR, stdio: 'pipe' });
    } catch (error) {
      validationFailed = true;
    }

    assert(validationFailed, 'Validation should fail for invalid dataScope');
    cleanupTestExtension(extName);
  });

  // Test 4: Missing index.js fails validation
  test('Fails validation when index.js is missing', () => {
    const extName = 'test_validate_4';
    cleanupTestExtension(extName);
    createTestExtension(extName);

    // Remove index.js
    fs.unlinkSync(path.join(EXTENSIONS_OFFICIAL_DIR, extName, 'index.js'));

    let validationFailed = false;
    try {
      execSync('node scripts/validate.js', { cwd: ROOT_DIR, stdio: 'pipe' });
    } catch (error) {
      validationFailed = true;
    }

    assert(validationFailed, 'Validation should fail for missing index.js');
    cleanupTestExtension(extName);
  });
}

/**
 * Main test runner
 */
async function main() {
  console.log(`${colors.cyan}🧪 Running Build Script Tests${colors.reset}\n`);
  console.log('='.repeat(50));

  try {
    // Run test suites
    testBumpScript();
    testValidateScript();

    // Final cleanup to ensure no test artifacts remain
    const testExtensions = [
      'test_bump_1', 'test_bump_2', 'test_bump_3', 'test_bump_4',
      'test_validate_1', 'test_validate_2', 'test_validate_3', 'test_validate_4'
    ];
    testExtensions.forEach(extName => cleanupTestExtension(extName));

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log(`\n${colors.cyan}📊 Test Summary:${colors.reset}`);
    console.log(`  Total tests: ${totalTests}`);
    console.log(`  ${colors.green}Passed: ${passedTests}${colors.reset}`);
    console.log(`  ${colors.red}Failed: ${failedTests}${colors.reset}`);

    if (failedTests > 0) {
      console.log(`\n${colors.red}❌ Some tests failed!${colors.reset}`);
      process.exit(1);
    }

    console.log(`\n${colors.green}✅ All tests passed!${colors.reset}`);
    process.exit(0);
  } catch (error) {
    console.error(`\n${colors.red}❌ Test runner failed:${colors.reset}`, error);
    // Cleanup on error too
    const testExtensions = [
      'test_bump_1', 'test_bump_2', 'test_bump_3', 'test_bump_4',
      'test_validate_1', 'test_validate_2', 'test_validate_3', 'test_validate_4'
    ];
    testExtensions.forEach(extName => cleanupTestExtension(extName));
    process.exit(1);
  }
}

// Run tests
main();
