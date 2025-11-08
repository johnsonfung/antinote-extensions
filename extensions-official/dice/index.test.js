// Test file for dice extension
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
    toBeGreaterThanOrEqual: function(expected) {
      if (actual < expected) {
        throw new Error("Expected " + actual + " to be >= " + expected);
      }
    },
    toBeLessThanOrEqual: function(expected) {
      if (actual > expected) {
        throw new Error("Expected " + actual + " to be <= " + expected);
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
describe("Dice Extension - Metadata Validation", function() {

  it("should have required name field", function() {
    expect(metadata.name).toBeDefined();
    expect(metadata.name).toBe("dice");
  });

  it("should have required version field", function() {
    expect(metadata.version).toBeDefined();
    expect(metadata.version).toBe("1.0.0");
  });

  it("should have required author field", function() {
    expect(metadata.author).toBeDefined();
  });

  it("should have required description field", function() {
    expect(metadata.description).toBeDefined();
  });

  it("should have required license field", function() {
    expect(metadata.license).toBeDefined();
  });

  it("should have required category field", function() {
    expect(metadata.category).toBeDefined();
    expect(metadata.category).toBe("Random Generators");
  });

  it("should have required dataScope field", function() {
    expect(metadata.dataScope).toBeDefined();
    expect(metadata.dataScope).toBe("none");
  });

  it("should have endpoints array", function() {
    expect(metadata.endpoints).toBeDefined();
    expect(metadata.endpoints).toBeArray();
  });

  it("should have requiredAPIKeys array", function() {
    expect(metadata.requiredAPIKeys).toBeDefined();
    expect(metadata.requiredAPIKeys).toBeArray();
  });

  it("should have commands array with at least one command", function() {
    expect(metadata.commands).toBeDefined();
    expect(metadata.commands).toBeArray();
    expect(metadata.commands.length).toBeGreaterThanOrEqual(1);
  });

  it("should have valid command structure", function() {
    var command = metadata.commands[0];
    expect(command.name).toBeDefined();
    expect(command.description).toBeDefined();
    expect(command.type).toBeDefined();
    expect(command.name).toBe("roll");
    expect(command.type).toBe("insert");
  });
});

// Load the base framework and extension code for execution tests
// Note: In a real test environment, these would be loaded via require or eval
// For now, we'll assume they're available in the global scope

describe("Dice Extension - Command Execution Tests", function() {

  it("should roll a single D6 by default", function() {
    var payload = {
      parameters: [],
      fullText: "",
      userSettings: {}
    };

    var result = roll.execute(payload);
    expect(result.status).toBe("success");
    expect(result.message).toBeDefined();
    expect(result.payload).toBeDefined();

    var value = parseInt(result.payload);
    expect(value).toBeGreaterThanOrEqual(1);
    expect(value).toBeLessThanOrEqual(6);
  });

  it("should roll a D20 when specified", function() {
    var payload = {
      parameters: ["D20"],
      fullText: "",
      userSettings: {}
    };

    var result = roll.execute(payload);
    expect(result.status).toBe("success");

    var value = parseInt(result.payload);
    expect(value).toBeGreaterThanOrEqual(1);
    expect(value).toBeLessThanOrEqual(20);
  });

  it("should roll multiple dice and return comma-separated results", function() {
    var payload = {
      parameters: ["D6", "3"],
      fullText: "",
      userSettings: {}
    };

    var result = roll.execute(payload);
    expect(result.status).toBe("success");
    expect(result.payload).toContain(", ");

    var values = result.payload.split(", ");
    expect(values.length).toBe(3);

    // Check each value is in valid range
    for (var i = 0; i < values.length; i++) {
      var value = parseInt(values[i]);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(6);
    }
  });

  it("should handle lowercase die type (d20)", function() {
    var payload = {
      parameters: ["d20"],
      fullText: "",
      userSettings: {}
    };

    var result = roll.execute(payload);
    expect(result.status).toBe("success");

    var value = parseInt(result.payload);
    expect(value).toBeGreaterThanOrEqual(1);
    expect(value).toBeLessThanOrEqual(20);
  });

  it("should handle die type without 'D' prefix", function() {
    var payload = {
      parameters: ["12"],
      fullText: "",
      userSettings: {}
    };

    var result = roll.execute(payload);
    expect(result.status).toBe("success");

    var value = parseInt(result.payload);
    expect(value).toBeGreaterThanOrEqual(1);
    expect(value).toBeLessThanOrEqual(12);
  });

  it("should return error for invalid die type (D1)", function() {
    var payload = {
      parameters: ["D1"],
      fullText: "",
      userSettings: {}
    };

    var result = roll.execute(payload);
    expect(result.status).toBe("error");
    expect(result.message).toContain("at least D2");
  });

  it("should return error for die type exceeding D1000", function() {
    var payload = {
      parameters: ["D1001"],
      fullText: "",
      userSettings: {}
    };

    var result = roll.execute(payload);
    expect(result.status).toBe("error");
    expect(result.message).toContain("cannot exceed D1000");
  });

  it("should return error for zero dice", function() {
    var payload = {
      parameters: ["D6", "0"],
      fullText: "",
      userSettings: {}
    };

    var result = roll.execute(payload);
    expect(result.status).toBe("error");
    expect(result.message).toContain("at least 1");
  });

  it("should return error for more than 100 dice", function() {
    var payload = {
      parameters: ["D6", "101"],
      fullText: "",
      userSettings: {}
    };

    var result = roll.execute(payload);
    expect(result.status).toBe("error");
    expect(result.message).toContain("Cannot roll more than 100");
  });

  it("should return single number for one die", function() {
    var payload = {
      parameters: ["D6", "1"],
      fullText: "",
      userSettings: {}
    };

    var result = roll.execute(payload);
    expect(result.status).toBe("success");

    // Should be a number without commas
    var hasComma = result.payload.indexOf(",") !== -1;
    expect(hasComma).toBe(false);
  });

  it("should return ReturnObject with correct structure", function() {
    var payload = {
      parameters: [],
      fullText: "",
      userSettings: {}
    };

    var result = roll.execute(payload);
    expect(result.status).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.payload).toBeDefined();
  });
});

// Run the tests
console.log("Running Dice Extension Tests...");
console.log("=================================");
