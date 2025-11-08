// Test file for ai_process extension
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
describe("AI Process Extension - Metadata Validation", function() {

  it("should have required name field", function() {
    expect(metadata.name).toBeDefined();
    expect(metadata.name).toBe("ai_process");
  });

  it("should have required version field", function() {
    expect(metadata.version).toBeDefined();
    expect(metadata.version).toBe("1.0.0");
  });

  it("should have required author field", function() {
    expect(metadata.author).toBeDefined();
    expect(metadata.author).toBe("johnsonfung");
  });

  it("should have required description field", function() {
    expect(metadata.description).toBeDefined();
  });

  it("should have required license field", function() {
    expect(metadata.license).toBeDefined();
    expect(metadata.license).toBe("MIT");
  });

  it("should have required category field", function() {
    expect(metadata.category).toBeDefined();
    expect(metadata.category).toBe("AI & ML");
  });

  it("should have required dataScope field", function() {
    expect(metadata.dataScope).toBeDefined();
    expect(metadata.dataScope).toBe("full");
  });

  it("should have empty endpoints array (inherited from ai_providers)", function() {
    expect(metadata.endpoints).toBeDefined();
    expect(metadata.endpoints).toBeArray();
    expect(metadata.endpoints.length).toBe(0);
  });

  it("should have empty requiredAPIKeys array (inherited from ai_providers)", function() {
    expect(metadata.requiredAPIKeys).toBeDefined();
    expect(metadata.requiredAPIKeys).toBeArray();
    expect(metadata.requiredAPIKeys.length).toBe(0);
  });

  it("should declare dependency on ai_providers", function() {
    expect(metadata.dependencies).toBeDefined();
    expect(metadata.dependencies).toBeArray();
    expect(metadata.dependencies.length).toBe(1);
    expect(metadata.dependencies[0]).toBe("ai_providers");
  });

  it("should have commands array with 3 commands", function() {
    expect(metadata.commands).toBeDefined();
    expect(metadata.commands).toBeArray();
    expect(metadata.commands.length).toBe(3);
  });

  it("should have polish, translate, and create_list commands", function() {
    var commandNames = metadata.commands.map(function(cmd) { return cmd.name; });
    expect(commandNames.indexOf("polish")).toBeGreaterThanOrEqual(0);
    expect(commandNames.indexOf("translate")).toBeGreaterThanOrEqual(0);
    expect(commandNames.indexOf("create_list")).toBeGreaterThanOrEqual(0);
  });

  it("should have all commands with replaceAll type", function() {
    metadata.commands.forEach(function(cmd) {
      expect(cmd.type).toBe("replaceAll");
    });
  });
});

// Tests for command execution
describe("AI Process Extension - Command Execution Tests", function() {

  describe("polish command", function() {
    // Note: We can't easily test the "service not available" case because
    // callAIProvider is mocked in the test runner. Skipping that test.

    it("should return error for invalid level (less than 1)", function() {
      var payload = {
        parameters: [0],
        fullText: "Some text",
        userSettings: {},
        preferences: {}
      };

      var result = polish.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("Level must be 1, 2, or 3");
    });

    it("should return error for invalid level (greater than 3)", function() {
      var payload = {
        parameters: [4],
        fullText: "Some text",
        userSettings: {},
        preferences: {}
      };

      var result = polish.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("Level must be 1, 2, or 3");
    });

    it("should return error for empty text", function() {
      var payload = {
        parameters: [2],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = polish.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("No text to polish");
    });

    it("should accept level 1 (casual)", function() {
      var payload = {
        parameters: [1],
        fullText: "This is some text to polish.",
        userSettings: {},
        preferences: {}
      };

      var result = polish.execute(payload);
      expect(result.status).toBe("success");
    });

    it("should accept level 2 (professional)", function() {
      var payload = {
        parameters: [2],
        fullText: "This is some text to polish.",
        userSettings: {},
        preferences: {}
      };

      var result = polish.execute(payload);
      expect(result.status).toBe("success");
    });

    it("should accept level 3 (formal)", function() {
      var payload = {
        parameters: [3],
        fullText: "This is some text to polish.",
        userSettings: {},
        preferences: {}
      };

      var result = polish.execute(payload);
      expect(result.status).toBe("success");
    });
  });

  describe("translate command", function() {
    // Note: We can't easily test the "service not available" case because
    // callAIProvider is mocked in the test runner. Skipping that test.

    it("should return error for empty text", function() {
      var payload = {
        parameters: ["French"],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = translate.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("No text to translate");
    });

    it("should accept translation with specified language", function() {
      var payload = {
        parameters: ["French"],
        fullText: "Hello, how are you?",
        userSettings: {},
        preferences: {}
      };

      var result = translate.execute(payload);
      expect(result.status).toBe("success");
    });

    it("should accept translation without language (uses default)", function() {
      var payload = {
        parameters: [""],
        fullText: "Hello, how are you?",
        userSettings: {},
        preferences: {}
      };

      var result = translate.execute(payload);
      expect(result.status).toBe("success");
    });
  });

  describe("create_list command", function() {
    // Note: We can't easily test the "service not available" case because
    // callAIProvider is mocked in the test runner. Skipping that test.

    it("should return error for empty text", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = create_list.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("No text to process");
    });

    it("should process text and create a list", function() {
      var payload = {
        parameters: [],
        fullText: "I need to buy milk, bread, and eggs from the store.",
        userSettings: {},
        preferences: {}
      };

      var result = create_list.execute(payload);
      expect(result.status).toBe("success");
    });
  });
});

console.log("\nRunning AI Process Extension Tests...");
console.log("========================================\n");
