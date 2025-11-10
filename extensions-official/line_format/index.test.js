// Test file for line_format extension
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
describe("Line Format Extension - Metadata Validation", function() {

  it("should have required name field", function() {
    expect(metadata.name).toBeDefined();
    expect(metadata.name).toBe("line_format");
  });

  it("should have required version field", function() {
    expect(metadata.version).toBeDefined();
    expect(metadata.version).toBeDefined();
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
    expect(metadata.dataScope).toBe("line");
  });

  it("should have 8 commands", function() {
    expect(metadata.commands).toBeDefined();
    expect(metadata.commands).toBeArray();
    expect(metadata.commands.length).toBe(8);
  });
});

// Load the base framework and extension code for execution tests
// Note: In a real test environment, these would be loaded via require or eval
// For now, we'll assume they're available in the global scope

describe("Line Format Extension - Command Execution Tests", function() {

  describe("uppercase_line command", function() {
    it("should convert to uppercase", function() {
      var payload = {
        parameters: [],
        fullText: "hello world",
        userSettings: {},
        preferences: {}
      };

      var result = uppercase_line.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("HELLO WORLD");
    });
  });

  describe("lowercase_line command", function() {
    it("should convert to lowercase", function() {
      var payload = {
        parameters: [],
        fullText: "HELLO WORLD",
        userSettings: {},
        preferences: {}
      };

      var result = lowercase_line.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("hello world");
    });
  });

  describe("sentence_case_line command", function() {
    it("should convert to sentence case", function() {
      var payload = {
        parameters: [],
        fullText: "hello world",
        userSettings: {},
        preferences: {}
      };

      var result = sentence_case_line.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Hello world");
    });
  });

  describe("title_case_line command", function() {
    it("should convert to title case", function() {
      var payload = {
        parameters: [],
        fullText: "hello world",
        userSettings: {},
        preferences: {}
      };

      var result = title_case_line.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Hello World");
    });
  });

  describe("camel_case command", function() {
    it("should convert to camelCase", function() {
      var payload = {
        parameters: [],
        fullText: "hello world",
        userSettings: {},
        preferences: {}
      };

      var result = camel_case.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("helloWorld");
    });
  });

  describe("snake_case command", function() {
    it("should convert to snake_case", function() {
      var payload = {
        parameters: [],
        fullText: "hello world",
        userSettings: {},
        preferences: {}
      };

      var result = snake_case.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("hello_world");
    });
  });

  describe("kebab_case command", function() {
    it("should convert to kebab-case", function() {
      var payload = {
        parameters: [],
        fullText: "hello world",
        userSettings: {},
        preferences: {}
      };

      var result = kebab_case.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("hello-world");
    });
  });

  describe("remove_quotes_line command", function() {
    it("should remove double quotes", function() {
      var payload = {
        parameters: [],
        fullText: '"hello world"',
        userSettings: {},
        preferences: {}
      };

      var result = remove_quotes_line.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("hello world");
    });

    it("should remove single quotes", function() {
      var payload = {
        parameters: [],
        fullText: "'hello world'",
        userSettings: {},
        preferences: {}
      };

      var result = remove_quotes_line.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("hello world");
    });
  });
});

// Run the tests
console.log("Running Line Format Extension Tests...");
console.log("=======================================");
