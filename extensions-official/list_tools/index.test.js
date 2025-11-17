// Test file for list_tools extension
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
describe("List Tools Extension - Metadata Validation", function() {

  it("should have required name field", function() {
    expect(metadata.name).toBeDefined();
    expect(metadata.name).toBe("list_tools");
  });

  it("should have required version field", function() {
    expect(metadata.version).toBeDefined();
  });

  it("should have required author field", function() {
    expect(metadata.author).toBeDefined();
  });

  it("should have required category field", function() {
    expect(metadata.category).toBeDefined();
    expect(metadata.category).toBe("Text Manipulation");
  });

  it("should have required dataScope field", function() {
    expect(metadata.dataScope).toBeDefined();
    expect(metadata.dataScope).toBe("full");
  });

  it("should have 4 commands", function() {
    expect(metadata.commands).toBeDefined();
    expect(metadata.commands).toBeArray();
    expect(metadata.commands.length).toBe(4);
  });
});

describe("List Tools Extension - Command Execution Tests", function() {

  describe("commas_to_list command", function() {
    it("should convert comma-separated to lines", function() {
      var payload = {
        parameters: [],
        fullText: "apple, banana, cherry",
        userSettings: {},
        preferences: {}
      };

      var result = commas_to_list.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("apple\nbanana\ncherry");
    });

    it("should respect quotes when parsing", function() {
      var payload = {
        parameters: [],
        fullText: '"Smith, John", 25, "New York"',
        userSettings: {},
        preferences: {}
      };

      var result = commas_to_list.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toContain('"Smith, John"');
    });
  });

  describe("commas_to command", function() {
    it("should convert commas to custom delimiter", function() {
      var payload = {
        parameters: ["|"],
        fullText: "apple, banana, cherry",
        userSettings: {},
        preferences: {}
      };

      var result = commas_to.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("apple|banana|cherry");
    });
  });

  describe("lines_to_commas command", function() {
    it("should convert lines to comma-separated", function() {
      var payload = {
        parameters: [],
        fullText: "apple\nbanana\ncherry",
        userSettings: {},
        preferences: {}
      };

      var result = lines_to_commas.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("apple, banana, cherry");
    });
  });

  describe("lines_to command", function() {
    it("should convert lines to custom delimiter", function() {
      var payload = {
        parameters: ["|"],
        fullText: "apple\nbanana\ncherry",
        userSettings: {},
        preferences: {}
      };

      var result = lines_to.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("apple|banana|cherry");
    });
  });
});

// Run the tests
console.log("Running List Tools Extension Tests...");
console.log("=======================================");
