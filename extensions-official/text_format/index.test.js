// Test file for text_format extension
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
describe("Text Format Extension - Metadata Validation", function() {

  it("should have required name field", function() {
    expect(metadata.name).toBeDefined();
    expect(metadata.name).toBe("text_format");
  });

  it("should have required version field", function() {
    expect(metadata.version).toBeDefined();
    expect(metadata.version).toBe("1.0.0");
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
    expect(metadata.dataScope).toBe("full");
  });

  it("should have 9 commands", function() {
    expect(metadata.commands).toBeDefined();
    expect(metadata.commands).toBeArray();
    expect(metadata.commands.length).toBe(9);
  });
});

// Load the base framework and extension code for execution tests
// Note: In a real test environment, these would be loaded via require or eval
// For now, we'll assume they're available in the global scope

describe("Text Format Extension - Command Execution Tests", function() {

  describe("replace command", function() {
    it("should replace text in document", function() {
      var payload = {
        parameters: ["foo", "bar"],
        fullText: "foo is foo",
        userSettings: {},
        preferences: {}
      };

      var result = replace.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("bar is bar");
    });
  });

  describe("append command", function() {
    it("should append text to document", function() {
      var payload = {
        parameters: [" END"],
        fullText: "Hello",
        userSettings: {},
        preferences: {}
      };

      var result = append.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Hello END");
    });
  });

  describe("prepend command", function() {
    it("should prepend text to document", function() {
      var payload = {
        parameters: ["START "],
        fullText: "Hello",
        userSettings: {},
        preferences: {}
      };

      var result = prepend.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("START Hello");
    });
  });

  describe("uppercase command", function() {
    it("should convert entire document to uppercase", function() {
      var payload = {
        parameters: [],
        fullText: "hello world",
        userSettings: {},
        preferences: {}
      };

      var result = uppercase.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("HELLO WORLD");
    });
  });

  describe("lowercase command", function() {
    it("should convert entire document to lowercase", function() {
      var payload = {
        parameters: [],
        fullText: "HELLO WORLD",
        userSettings: {},
        preferences: {}
      };

      var result = lowercase.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("hello world");
    });
  });

  describe("sentence_case command", function() {
    it("should convert to sentence case", function() {
      var payload = {
        parameters: [],
        fullText: "hello. world.",
        userSettings: {},
        preferences: {}
      };

      var result = sentence_case.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toContain("Hello");
    });
  });

  describe("title_case command", function() {
    it("should convert to title case", function() {
      var payload = {
        parameters: [],
        fullText: "hello world",
        userSettings: {},
        preferences: {}
      };

      var result = title_case.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Hello World");
    });
  });

  describe("capitalize_first command", function() {
    it("should capitalize first letter only", function() {
      var payload = {
        parameters: [],
        fullText: "hello world",
        userSettings: {},
        preferences: {}
      };

      var result = capitalize_first.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Hello world");
    });
  });

  describe("remove_quotes command", function() {
    it("should remove surrounding quotes", function() {
      var payload = {
        parameters: [],
        fullText: '"hello world"',
        userSettings: {},
        preferences: {}
      };

      var result = remove_quotes.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("hello world");
    });
  });
});

// Run the tests
console.log("Running Text Format Extension Tests...");
console.log("=======================================");
