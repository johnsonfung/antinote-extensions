// Test file for clean_line extension
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
    }
  };
}

// Load and parse extension.json
var metadataPath = path.join(__dirname, 'extension.json');
var metadataContent = fs.readFileSync(metadataPath, 'utf8');
var metadata = JSON.parse(metadataContent);

// Tests for extension metadata
describe("Clean Line Extension - Metadata Validation", function() {

  it("should have required name field", function() {
    expect(metadata.name).toBeDefined();
    expect(metadata.name).toBe("clean_line");
  });

  it("should have required version field", function() {
    expect(metadata.version).toBeDefined();
  });

  it("should have required author field", function() {
    expect(metadata.author).toBeDefined();
  });

  it("should have required category field", function() {
    expect(metadata.category).toBeDefined();
    expect(metadata.category).toBe("Text Formatting");
  });

  it("should have required dataScope field", function() {
    expect(metadata.dataScope).toBeDefined();
    expect(metadata.dataScope).toBe("line");
  });

  it("should have 2 commands", function() {
    expect(metadata.commands).toBeDefined();
    expect(metadata.commands).toBeArray();
    expect(metadata.commands.length).toBe(2);
  });
});

describe("Clean Line Extension - Command Execution Tests", function() {

  describe("remove_all_whitespace command", function() {
    it("should remove all whitespace from line", function() {
      var payload = {
        parameters: "",
        fullText: "  Hello   World  ",
        userSettings: {},
        preferences: {}
      };

      var result = remove_all_whitespace.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("HelloWorld");
    });

    it("should handle tabs and newlines", function() {
      var payload = {
        parameters: "",
        fullText: "Hello\tWorld\nTest",
        userSettings: {},
        preferences: {}
      };

      var result = remove_all_whitespace.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("HelloWorldTest");
    });
  });

  describe("trim_whitespace command", function() {
    it("should trim leading and trailing whitespace", function() {
      var payload = {
        parameters: "",
        fullText: "  Hello World  ",
        userSettings: {},
        preferences: {}
      };

      var result = trim_whitespace.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Hello World");
    });

    it("should preserve internal whitespace", function() {
      var payload = {
        parameters: "",
        fullText: "  Hello   World  ",
        userSettings: {},
        preferences: {}
      };

      var result = trim_whitespace.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Hello   World");
    });
  });
});

// Run the tests
console.log("Running Clean Line Extension Tests...");
console.log("=======================================");
