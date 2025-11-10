#!/usr/bin/env node

/**
 * Test Script for Build Scripts
 *
 * Tests the bump-changed-extensions.js and validate.js scripts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import functions to test
const {
  parseVersion,
  bumpPatchVersion,
  wasVersionManuallyChanged
} = require('./bump-changed-extensions.js');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');

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
 * Deep equality check
 */
function assertEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(message || `Expected ${expectedStr} but got ${actualStr}`);
  }
}

/**
 * Test Suite: bump-changed-extensions.js (Unit Tests)
 */
function testBumpScriptLogic() {
  console.log(`\n${colors.cyan}Testing bump-changed-extensions.js (Core Logic)${colors.reset}`);

  test('parseVersion parses semantic versions correctly', () => {
    assertEqual(parseVersion('1.0.0'), { major: 1, minor: 0, patch: 0 });
    assertEqual(parseVersion('2.5.9'), { major: 2, minor: 5, patch: 9 });
    assertEqual(parseVersion('10.20.30'), { major: 10, minor: 20, patch: 30 });
    assertEqual(parseVersion('0.0.1'), { major: 0, minor: 0, patch: 1 });
  });

  test('parseVersion handles malformed versions', () => {
    assertEqual(parseVersion('1'), { major: 1, minor: 0, patch: 0 });
    assertEqual(parseVersion('1.2'), { major: 1, minor: 2, patch: 0 });
  });

  test('bumpPatchVersion increments patch correctly', () => {
    assert(bumpPatchVersion('1.0.0') === '1.0.1');
    assert(bumpPatchVersion('1.0.9') === '1.0.10');
    assert(bumpPatchVersion('2.5.9') === '2.5.10');
    assert(bumpPatchVersion('0.0.0') === '0.0.1');
  });

  test('bumpPatchVersion handles double-digit patches', () => {
    assert(bumpPatchVersion('1.0.99') === '1.0.100');
    assert(bumpPatchVersion('2.5.999') === '2.5.1000');
  });

  test('wasVersionManuallyChanged detects version changes', () => {
    assert(wasVersionManuallyChanged('1.1.0', '1.0.0') === true, 'Should detect minor bump');
    assert(wasVersionManuallyChanged('2.0.0', '1.0.0') === true, 'Should detect major bump');
    assert(wasVersionManuallyChanged('1.0.1', '1.0.0') === true, 'Should detect patch bump');
  });

  test('wasVersionManuallyChanged returns false when unchanged', () => {
    assert(wasVersionManuallyChanged('1.0.0', '1.0.0') === false, 'Should return false for same version');
    assert(wasVersionManuallyChanged('2.5.9', '2.5.9') === false, 'Should return false for same version');
  });

  test('bump script runs without crashing', () => {
    try {
      // Just verify the script can run without throwing
      // It may or may not find changed extensions, that's fine
      execSync('node scripts/bump-changed-extensions.js', {
        cwd: ROOT_DIR,
        stdio: 'pipe'
      });
      // If we get here, it didn't crash
    } catch (error) {
      // Script may exit with code 0 even if no changes, that's fine
      // Only fail if there's an actual error
      if (error.status !== 0 && error.stderr && error.stderr.toString().includes('Error')) {
        throw error;
      }
    }
  });
}

/**
 * Test Suite: validate.js (Smoke Test)
 */
function testValidateScript() {
  console.log(`\n${colors.cyan}Testing validate.js (Smoke Test)${colors.reset}`);

  test('validate script runs without crashing', () => {
    try {
      execSync('node scripts/validate.js', {
        cwd: ROOT_DIR,
        stdio: 'pipe'
      });
      // If we get here, validation passed
    } catch (error) {
      // Check if it's a real error or just validation warnings
      const stderr = error.stderr ? error.stderr.toString() : '';
      const stdout = error.stdout ? error.stdout.toString() : '';

      // If validation found errors (not warnings), fail the test
      if (stderr.includes('Error') || stdout.includes('❌')) {
        throw new Error('Validation script reported errors');
      }
      // Warnings are okay
    }
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
    testBumpScriptLogic();
    testValidateScript();

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
    process.exit(1);
  }
}

// Run tests
main();
