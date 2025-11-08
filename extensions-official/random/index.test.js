// Test file for random extension
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
describe("Random Extension - Metadata Validation", function() {

  it("should have required name field", function() {
    expect(metadata.name).toBeDefined();
    expect(metadata.name).toBe("random");
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

  it("should have 4 commands (random_number, random_letters, random_quote, random_wiki)", function() {
    expect(metadata.commands.length).toBe(4);
    expect(metadata.commands[0].name).toBe("random_number");
    expect(metadata.commands[1].name).toBe("random_letters");
    expect(metadata.commands[2].name).toBe("random_quote");
    expect(metadata.commands[3].name).toBe("random_wiki");
  });
});

// Load the base framework and extension code for execution tests
// Note: In a real test environment, these would be loaded via require or eval
// For now, we'll assume they're available in the global scope

describe("Random Extension - Command Execution Tests", function() {

  describe("random_number command", function() {
    it("should generate a number between 0 and 100 by default", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {}
      };

      var result = random_number.execute(payload);
      expect(result.status).toBe("success");
      expect(result.message).toBeDefined();
      expect(result.payload).toBeDefined();

      var value = parseFloat(result.payload);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    });

    it("should return error when from > to", function() {
      var payload = {
        parameters: ["100", "10"],
        fullText: "",
        userSettings: {}
      };

      var result = random_number.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("from");
    });
  });

  describe("random_letters command", function() {
    it("should generate 1 letter by default", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {}
      };

      var result = random_letters.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload.length).toBe(1);
    });

    it("should generate specified number of letters", function() {
      var payload = {
        parameters: ["5"],
        fullText: "",
        userSettings: {}
      };

      var result = random_letters.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload.length).toBe(5);
    });

    it("should return error for too many letters", function() {
      var payload = {
        parameters: ["1001"],
        fullText: "",
        userSettings: {}
      };

      var result = random_letters.execute(payload);
      expect(result.status).toBe("error");
    });
  });

  describe("random_quote command", function() {
    it("should return a quote", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {}
      };

      var result = random_quote.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBeDefined();
      expect(result.payload.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("random_wiki command", function() {
    it("should return a Wikipedia URL", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {}
      };

      var result = random_wiki.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toContain("wikipedia.org");
    });
  });
});

// Run the tests
console.log("Running Random Extension Tests...");
console.log("==================================");
