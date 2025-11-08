// Test file for date extension
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
describe("Date Extension - Metadata Validation", function() {

  it("should have required name field", function() {
    expect(metadata.name).toBeDefined();
    expect(metadata.name).toBe("date");
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
    expect(metadata.category).toBe("Date & Time");
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

  it("should have 4 commands (today, tomorrow, yesterday, businessDay)", function() {
    expect(metadata.commands.length).toBe(4);
    expect(metadata.commands[0].name).toBe("today");
    expect(metadata.commands[1].name).toBe("tomorrow");
    expect(metadata.commands[2].name).toBe("yesterday");
    expect(metadata.commands[3].name).toBe("businessDay");
  });
});

// Load the base framework and extension code for execution tests
// Note: In a real test environment, these would be loaded via require or eval
// For now, we'll assume they're available in the global scope

describe("Date Extension - Command Execution Tests", function() {

  describe("today command", function() {
    it("should return today's date", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = today.execute(payload);
      expect(result.status).toBe("success");
      expect(result.message).toBeDefined();
      expect(result.payload).toBeDefined();
      expect(result.payload.length).toBeGreaterThanOrEqual(1);
    });

    it("should handle positive offset", function() {
      var payload = {
        parameters: ["7"],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = today.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBeDefined();
    });

    it("should handle negative offset", function() {
      var payload = {
        parameters: ["-5"],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = today.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBeDefined();
    });
  });

  describe("tomorrow command", function() {
    it("should return tomorrow's date", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = tomorrow.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBeDefined();
    });
  });

  describe("yesterday command", function() {
    it("should return yesterday's date", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = yesterday.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBeDefined();
    });
  });

  describe("businessDay command", function() {
    it("should return a business day", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = businessDay.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBeDefined();
    });

    it("should handle positive offset", function() {
      var payload = {
        parameters: ["5"],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = businessDay.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBeDefined();
    });

    it("should handle negative offset", function() {
      var payload = {
        parameters: ["-3"],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = businessDay.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBeDefined();
    });
  });
});

// Run the tests
console.log("Running Date Extension Tests...");
console.log("================================");
