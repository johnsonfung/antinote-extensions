// Test file for checklists extension
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
describe("Checklists Extension - Metadata Validation", function() {

  it("should have required name field", function() {
    expect(metadata.name).toBeDefined();
    expect(metadata.name).toBe("checklists");
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

  it("should have 2 commands", function() {
    expect(metadata.commands).toBeDefined();
    expect(metadata.commands).toBeArray();
    expect(metadata.commands.length).toBe(2);
  });
});

describe("Checklists Extension - Command Execution Tests", function() {

  describe("checked_to_bottom command", function() {
    it("should move checked items to bottom", function() {
      var payload = {
        parameters: [],
        fullText: "Task 1 /x\nTask 2\nTask 3 /x\nTask 4",
        activeKeywords: ["list"],
        checkedCheckboxTriggers: ["/x"],
        userSettings: {},
        preferences: {}
      };

      var result = checked_to_bottom.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Task 2\nTask 4\nTask 1 /x\nTask 3 /x");
    });

    it("should return original if no checked items", function() {
      var payload = {
        parameters: [],
        fullText: "Task 1\nTask 2\nTask 3",
        activeKeywords: ["list"],
        checkedCheckboxTriggers: ["/x"],
        userSettings: {},
        preferences: {}
      };

      var result = checked_to_bottom.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Task 1\nTask 2\nTask 3");
      expect(result.message).toBe("No checked items found");
    });

    it("should error if list keyword not active", function() {
      var payload = {
        parameters: [],
        fullText: "Task 1 /x\nTask 2",
        activeKeywords: [],
        checkedCheckboxTriggers: ["/x"],
        userSettings: {},
        preferences: {}
      };

      var result = checked_to_bottom.execute(payload);
      expect(result.status).toBe("error");
    });
  });

  describe("remove_checked command", function() {
    it("should remove checked items", function() {
      var payload = {
        parameters: [],
        fullText: "Task 1 /x\nTask 2\nTask 3 /x\nTask 4",
        activeKeywords: ["list"],
        checkedCheckboxTriggers: ["/x"],
        userSettings: {},
        preferences: {}
      };

      var result = remove_checked.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Task 2\nTask 4");
    });

    it("should return original if no checked items", function() {
      var payload = {
        parameters: [],
        fullText: "Task 1\nTask 2\nTask 3",
        activeKeywords: ["list"],
        checkedCheckboxTriggers: ["/x"],
        userSettings: {},
        preferences: {}
      };

      var result = remove_checked.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Task 1\nTask 2\nTask 3");
      expect(result.message).toBe("No checked items found");
    });

    it("should error if list keyword not active", function() {
      var payload = {
        parameters: [],
        fullText: "Task 1 /x\nTask 2",
        activeKeywords: [],
        checkedCheckboxTriggers: ["/x"],
        userSettings: {},
        preferences: {}
      };

      var result = remove_checked.execute(payload);
      expect(result.status).toBe("error");
    });
  });
});

// Run the tests
console.log("Running Checklists Extension Tests...");
console.log("======================================");
