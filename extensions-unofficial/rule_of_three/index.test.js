// Test file for rule_of_three extension
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
describe("Rule of Three Extension - Metadata Validation", function() {

  it("should have required name field", function() {
    expect(metadata.name).toBeDefined();
    expect(metadata.name).toBe("rule_of_three");
  });

  it("should have required version field", function() {
    expect(metadata.version).toBeDefined();
    expect(metadata.version).toBe("1.0.1");
  });

  it("should have required author field", function() {
    expect(metadata.author).toBeDefined();
  });

  it("should have required category field", function() {
    expect(metadata.category).toBeDefined();
    expect(metadata.category).toBe("Math");
  });

  it("should have required dataScope field", function() {
    expect(metadata.dataScope).toBeDefined();
    expect(metadata.dataScope).toBe("none");
  });

  it("should have three command", function() {
    expect(metadata.commands).toBeDefined();
    expect(metadata.commands).toBeArray();
    expect(metadata.commands.length).toBeGreaterThanOrEqual(1);
    expect(metadata.commands[0].name).toBe("three");
  });
});

// Load the base framework and extension code for execution tests
// Note: In a real test environment, these would be loaded via require or eval
// For now, we'll assume they're available in the global scope

describe("Rule of Three Extension - Command Execution Tests", function() {

  describe("three command", function() {
    it("should calculate x on the right (5:10 = 1:x)", function() {
      var payload = {
        parameters: ["5", "10", "1", "x"],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = three.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("2");
    });

    it("should calculate x on the left (5:10 = x:2)", function() {
      var payload = {
        parameters: ["5", "10", "x", "2"],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = three.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("1");
    });

    it("should show logic diagram when logic=true", function() {
      var payload = {
        parameters: ["5", "10", "x", "2", "true"],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = three.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toContain("5 - 10");
      expect(result.payload).toContain("x:");
    });

    it("should handle units (5L:10m^3 = x:2m^3)", function() {
      var payload = {
        parameters: ["5L", "10m^3", "x", "2m^3"],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = three.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toContain("L");
    });

    it("should return error when both req1 and req2 are x", function() {
      var payload = {
        parameters: ["5", "10", "x", "x"],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = three.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("Only one parameter must be 'x'");
    });

    it("should return error when neither req1 nor req2 is x", function() {
      var payload = {
        parameters: ["5", "10", "1", "2"],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = three.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("3rd or 4th parameter must be 'x'");
    });

    it("should return error when ref1 or ref2 is x", function() {
      var payload = {
        parameters: ["x", "10", "x", "2"],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = three.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("first 2 parameters");
    });

    it("should handle decimal calculations", function() {
      var payload = {
        parameters: ["2.5", "5", "x", "10"],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = three.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("5");
    });
  });
});

// Run the tests
console.log("Running Rule of Three Extension Tests...");
console.log("=========================================");
