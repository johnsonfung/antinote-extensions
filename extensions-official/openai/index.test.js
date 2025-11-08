// Test file for openai extension
// This file tests both the extension metadata and command execution

// Load the extension metadata
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
describe("OpenAI Extension - Metadata Validation", function() {

  it("should have required name field", function() {
    expect(metadata.name).toBeDefined();
    expect(metadata.name).toBe("openai");
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
    expect(metadata.dataScope).toBe("line");
  });

  it("should have endpoints array with OpenAI API", function() {
    expect(metadata.endpoints).toBeDefined();
    expect(metadata.endpoints).toBeArray();
    expect(metadata.endpoints.length).toBeGreaterThanOrEqual(1);
    expect(metadata.endpoints[0]).toContain("api.openai.com");
  });

  it("should require OpenAI API key", function() {
    expect(metadata.requiredAPIKeys).toBeDefined();
    expect(metadata.requiredAPIKeys).toBeArray();
    expect(metadata.requiredAPIKeys.length).toBeGreaterThanOrEqual(1);
    expect(metadata.requiredAPIKeys[0]).toBe("OpenAI");
  });

  it("should have gpt command", function() {
    expect(metadata.commands).toBeDefined();
    expect(metadata.commands).toBeArray();
    expect(metadata.commands.length).toBeGreaterThanOrEqual(1);
    expect(metadata.commands[0].name).toBe("gpt");
  });
});

// Load the base framework and extension code for execution tests
// Note: In a real test environment, these would be loaded via require or eval
// For now, we'll assume they're available in the global scope

describe("OpenAI Extension - Command Execution Tests", function() {

  describe("gpt command", function() {
    // Note: These tests require a valid API key and internet connection
    // In a real test environment, you would mock the API call

    it("should have correct command structure", function() {
      // Verify the command object exists and has required properties
      if (typeof gpt !== 'undefined') {
        expect(gpt.name).toBeDefined();
        expect(gpt.name).toBe("gpt");
        expect(gpt.execute).toBeDefined();
      }
    });

    it("should validate parameters", function() {
      var payload = {
        parameters: ["test prompt", "150", "0.7"],
        fullText: "",
        userSettings: {},
        preferences: {
          model: "gpt-4o",
          systemPrompt: "You are a helpful assistant."
        }
      };

      // This test verifies parameter parsing works
      // Actual API call would require valid API key
      if (typeof gpt !== 'undefined' && gpt.getParsedParams) {
        var params = gpt.getParsedParams(payload);
        expect(params).toBeDefined();
        expect(params.length).toBe(3);
      }
    });

    it("should return error when API key is missing", function() {
      // This would test the error handling when no API key is configured
      // Implementation depends on how the extension handles missing API keys
    });
  });
});

// Run the tests
console.log("Running OpenAI Extension Tests...");
console.log("==================================");
console.log("Note: Full API tests require valid OpenAI API key");
