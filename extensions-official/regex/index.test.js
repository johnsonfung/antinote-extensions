// Test file for regex extension
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
describe("Regex Extension - Metadata Validation", function() {

  it("should have required name field", function() {
    expect(metadata.name).toBeDefined();
    expect(metadata.name).toBe("regex");
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

  it("should have 3 commands", function() {
    expect(metadata.commands).toBeDefined();
    expect(metadata.commands).toBeArray();
    expect(metadata.commands.length).toBe(3);
  });
});

describe("Regex Extension - Command Execution Tests", function() {

  describe("regex_remove command", function() {
    it("should remove all numbers", function() {
      var payload = {
        parameters: ["\\d+"],
        fullText: "Hello 123 World 456",
        userSettings: {},
        preferences: {}
      };

      var result = regex_remove.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Hello  World ");
    });

    it("should handle /pattern/flags format", function() {
      var payload = {
        parameters: ["/test/g"],
        fullText: "Test test TEST",
        userSettings: {},
        preferences: {}
      };

      var result = regex_remove.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Test  TEST");
    });
  });

  describe("regex_keep command", function() {
    it("should keep only numbers", function() {
      var payload = {
        parameters: ["\\d+"],
        fullText: "Hello 123 World 456",
        userSettings: {},
        preferences: {}
      };

      var result = regex_keep.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("123456");
    });

    it("should return error when no matches found", function() {
      var payload = {
        parameters: ["\\d+"],
        fullText: "Hello World",
        userSettings: {},
        preferences: {}
      };

      var result = regex_keep.execute(payload);
      expect(result.status).toBe("error");
      expect(result.payload).toBe("Hello World");
    });
  });

  describe("regex_insert command", function() {
    it("should extract numbers to lines", function() {
      var payload = {
        parameters: ["\\d+"],
        fullText: "Hello 123 World 456",
        userSettings: {},
        preferences: {}
      };

      var result = regex_insert.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("123\n456");
    });

    it("should use custom delimiter", function() {
      var payload = {
        parameters: ["\\d+", ", "],
        fullText: "Hello 123 World 456",
        userSettings: {},
        preferences: {}
      };

      var result = regex_insert.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("123, 456");
    });

    it("should return error when no matches found", function() {
      var payload = {
        parameters: ["\\d+"],
        fullText: "Hello World",
        userSettings: {},
        preferences: {}
      };

      var result = regex_insert.execute(payload);
      expect(result.status).toBe("error");
      expect(result.payload).toBe("Hello World");
    });
  });
});

// Run the tests
console.log("Running Regex Extension Tests...");
console.log("=======================================");
