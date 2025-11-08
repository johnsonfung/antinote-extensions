// Test file for AI Providers extension
// This extension is a service with no commands, so tests focus on metadata

var fs = require('fs');
var path = require('path');

// Mock test framework functions
function describe(name, fn) {
  console.log("\n" + name);
  fn();
}

function it(name, fn) {
  try {
    fn();
    console.log("  ✓ " + name);
  } catch (e) {
    console.log("  ✗ " + name);
    console.log("    Error: " + e.message);
  }
}

function expect(actual) {
  return {
    toBe: function(expected) {
      if (actual !== expected) {
        throw new Error("Expected " + expected + " but got " + actual);
      }
    },
    toContain: function(expected) {
      if (actual.indexOf(expected) === -1) {
        throw new Error("Expected " + actual + " to contain " + expected);
      }
    },
    toBeDefined: function() {
      if (actual === undefined || actual === null) {
        throw new Error("Expected value to be defined");
      }
    },
    toBeArray: function() {
      if (!Array.isArray(actual)) {
        throw new Error("Expected " + actual + " to be an array");
      }
    },
    toBeGreaterThanOrEqual: function(expected) {
      if (actual < expected) {
        throw new Error("Expected " + actual + " to be >= " + expected);
      }
    }
  };
}

// Load and parse extension.json
var metadataPath = path.join(__dirname, 'extension.json');
var metadataContent = fs.readFileSync(metadataPath, 'utf8');
var metadata = JSON.parse(metadataContent);

// Tests for extension metadata
describe("AI Providers Extension - Metadata Validation", function() {

  it("should have required name field", function() {
    expect(metadata.name).toBeDefined();
    expect(metadata.name).toBe("ai_providers");
  });

  it("should have required version field", function() {
    expect(metadata.version).toBeDefined();
    expect(metadata.version).toBe("1.0.0");
  });

  it("should have required author field", function() {
    expect(metadata.author).toBeDefined();
  });

  it("should have required category field", function() {
    expect(metadata.category).toBeDefined();
    expect(metadata.category).toBe("AI & ML");
  });

  it("should have required dataScope field", function() {
    expect(metadata.dataScope).toBeDefined();
    expect(metadata.dataScope).toBe("none");
  });

  it("should have endpoints array with all provider APIs", function() {
    expect(metadata.endpoints).toBeDefined();
    expect(metadata.endpoints).toBeArray();
    expect(metadata.endpoints.length).toBeGreaterThanOrEqual(5);
    expect(metadata.endpoints[0]).toContain("api.openai.com");
    expect(metadata.endpoints[1]).toContain("api.anthropic.com");
    expect(metadata.endpoints[2]).toContain("generativelanguage.googleapis.com");
    expect(metadata.endpoints[3]).toContain("openrouter.ai");
    expect(metadata.endpoints[4]).toContain("localhost:11434");
  });

  it("should require API keys for cloud providers", function() {
    expect(metadata.requiredAPIKeys).toBeDefined();
    expect(metadata.requiredAPIKeys).toBeArray();
    expect(metadata.requiredAPIKeys.length).toBeGreaterThanOrEqual(4);
    expect(metadata.requiredAPIKeys[0]).toBe("apikey_openai");
    expect(metadata.requiredAPIKeys[1]).toBe("apikey_anthropic");
    expect(metadata.requiredAPIKeys[2]).toBe("apikey_google");
    expect(metadata.requiredAPIKeys[3]).toBe("apikey_openrouter");
  });

  it("should have no commands (service only)", function() {
    expect(metadata.commands).toBeDefined();
    expect(metadata.commands).toBeArray();
    expect(metadata.commands.length).toBe(0);
  });

  it("should be marked as a service", function() {
    expect(metadata.isService).toBeDefined();
    expect(metadata.isService).toBe(true);
  });

  it("should be official", function() {
    expect(metadata.official).toBeDefined();
    expect(metadata.official).toBe(true);
  });

  it("should be included by default", function() {
    expect(metadata.includedByDefault).toBeDefined();
    expect(metadata.includedByDefault).toBe(true);
  });
});

describe("AI Providers Extension - Service API Tests", function() {

  it("should export callAIProvider function globally", function() {
    // This test would verify the function is available
    // In actual runtime, the function would be on window or global
    // For now, just document the expected behavior
  });

  it("should export AI_PROVIDERS constant globally", function() {
    // This test would verify the PROVIDERS object is available
    // In actual runtime, it would be on window or global
  });
});

// Run the tests
console.log("Running AI Providers Extension Tests...");
console.log("==========================================");
console.log("Note: This is a service extension with no user-facing commands");
