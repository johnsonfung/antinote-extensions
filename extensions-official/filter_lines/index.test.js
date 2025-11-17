// Test file for filter_lines extension
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
describe("Filter Lines Extension - Metadata Validation", function() {

  it("should have required name field", function() {
    expect(metadata.name).toBeDefined();
    expect(metadata.name).toBe("filter_lines");
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

  it("should have 12 commands", function() {
    expect(metadata.commands).toBeDefined();
    expect(metadata.commands).toBeArray();
    expect(metadata.commands.length).toBe(12);
  });
});

describe("Filter Lines Extension - Command Execution Tests", function() {

  describe("remove_lines_with command", function() {
    it("should remove lines containing text", function() {
      var payload = {
        parameters: ["TODO"],
        fullText: "This is a line\nTODO: Fix this\nAnother line\nTODO: And this",
        userSettings: {},
        preferences: {}
      };

      var result = remove_lines_with.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("This is a line\nAnother line");
    });
  });

  describe("remove_lines_without command", function() {
    it("should keep only lines containing text", function() {
      var payload = {
        parameters: ["TODO"],
        fullText: "This is a line\nTODO: Fix this\nAnother line\nTODO: And this",
        userSettings: {},
        preferences: {}
      };

      var result = remove_lines_without.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("TODO: Fix this\nTODO: And this");
    });
  });

  describe("remove_lines_empty command", function() {
    it("should remove empty lines", function() {
      var payload = {
        parameters: [],
        fullText: "Line 1\n\nLine 2\n   \nLine 3",
        userSettings: {},
        preferences: {}
      };

      var result = remove_lines_empty.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Line 1\nLine 2\nLine 3");
    });
  });

  describe("keep_lines_with command", function() {
    it("should keep only lines containing text", function() {
      var payload = {
        parameters: ["TODO"],
        fullText: "This is a line\nTODO: Fix this\nAnother line\nTODO: And this",
        userSettings: {},
        preferences: {}
      };

      var result = keep_lines_with.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("TODO: Fix this\nTODO: And this");
    });

    it("should handle case sensitivity", function() {
      var payload = {
        parameters: ["error", "true"],
        fullText: "This is an Error\nerror found\nNo issues here",
        userSettings: {},
        preferences: {}
      };

      var result = keep_lines_with.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("error found");
    });
  });

  describe("keep_lines_without command", function() {
    it("should keep only lines not containing text", function() {
      var payload = {
        parameters: ["TODO"],
        fullText: "This is a line\nTODO: Fix this\nAnother line\nTODO: And this",
        userSettings: {},
        preferences: {}
      };

      var result = keep_lines_without.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("This is a line\nAnother line");
    });

    it("should handle case sensitivity", function() {
      var payload = {
        parameters: ["error", "true"],
        fullText: "This is an Error\nerror found\nNo issues here",
        userSettings: {},
        preferences: {}
      };

      var result = keep_lines_without.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("This is an Error\nNo issues here");
    });
  });

  describe("trim_each_whitespace command", function() {
    it("should trim whitespace from each line", function() {
      var payload = {
        parameters: [],
        fullText: "  Line 1  \n\tLine 2\t\n   Line 3   ",
        userSettings: {},
        preferences: {}
      };

      var result = trim_each_whitespace.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Line 1\nLine 2\nLine 3");
    });
  });

  describe("remove_each_after command", function() {
    it("should remove content after delimiter", function() {
      var payload = {
        parameters: [","],
        fullText: "First,Second,Third\nA,B,C",
        userSettings: {},
        preferences: {}
      };

      var result = remove_each_after.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("First\nA");
    });
  });

  describe("remove_each_before command", function() {
    it("should remove content before delimiter", function() {
      var payload = {
        parameters: [","],
        fullText: "First,Second,Third\nA,B,C",
        userSettings: {},
        preferences: {}
      };

      var result = remove_each_before.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Third\nC");
    });
  });

  describe("keep_between command", function() {
    it("should keep content between delimiters", function() {
      var payload = {
        parameters: ["[", "]"],
        fullText: "Text [content] more\nAnother [item] here",
        userSettings: {},
        preferences: {}
      };

      var result = keep_between.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("content\nitem");
    });
  });

  describe("remove_between command", function() {
    it("should remove content between delimiters", function() {
      var payload = {
        parameters: ["[", "]"],
        fullText: "Text [content] more\nAnother [item] here",
        userSettings: {},
        preferences: {}
      };

      var result = remove_between.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Text [] more\nAnother [] here");
    });
  });

  describe("dedupe_lines command", function() {
    it("should remove duplicate lines keeping first", function() {
      var payload = {
        parameters: [],
        fullText: "apple\nbanana\napple\ncherry\nbanana",
        userSettings: {},
        preferences: {}
      };

      var result = dedupe_lines.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("apple\nbanana\ncherry");
    });

    it("should remove duplicate lines keeping last", function() {
      var payload = {
        parameters: ["false"],
        fullText: "apple\nbanana\napple\ncherry",
        userSettings: {},
        preferences: {}
      };

      var result = dedupe_lines.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("banana\napple\ncherry");
    });

    it("should ignore first line when deduping", function() {
      var payload = {
        parameters: ["true", "true"],
        fullText: "Header\napple\nbanana\napple\nbanana",
        userSettings: {},
        preferences: {}
      };

      var result = dedupe_lines.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Header\napple\nbanana");
    });
  });

  describe("get_dupes command", function() {
    it("should find duplicate lines", function() {
      var payload = {
        parameters: [],
        fullText: "apple\nbanana\napple\ncherry\nbanana\napple",
        userSettings: {},
        preferences: {}
      };

      var result = get_dupes.execute(payload);
      expect(result.status).toBe("success");
      // Should contain apple and banana as dupes
      var hasApple = result.payload.indexOf("apple") !== -1;
      var hasBanana = result.payload.indexOf("banana") !== -1;
      if (!hasApple || !hasBanana) {
        throw new Error("Expected to find both apple and banana as duplicates");
      }
    });

    it("should return message when no duplicates found", function() {
      var payload = {
        parameters: [],
        fullText: "apple\nbanana\ncherry",
        userSettings: {},
        preferences: {}
      };

      var result = get_dupes.execute(payload);
      expect(result.status).toBe("success");
      var hasNoDupes = result.payload.indexOf("No Duplicates Found") !== -1;
      if (!hasNoDupes) {
        throw new Error("Expected 'No Duplicates Found' message");
      }
    });
  });
});

// Run the tests
console.log("Running Filter Lines Extension Tests...");
console.log("=======================================");
