// Test file for line_sort extension
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
describe("Line Sort Extension - Metadata Validation", function() {

  it("should have required name field", function() {
    expect(metadata.name).toBeDefined();
    expect(metadata.name).toBe("line_sort");
  });

  it("should have required version field", function() {
    expect(metadata.version).toBeDefined();
    expect(metadata.version).toBeDefined();
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
    expect(metadata.category).toBe("Text Manipulation");
  });

  it("should have required dataScope field", function() {
    expect(metadata.dataScope).toBeDefined();
    expect(metadata.dataScope).toBe("full");
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

  it("should have 4 commands", function() {
    expect(metadata.commands.length).toBe(4);
    expect(metadata.commands[0].name).toBe("sort_lines_alpha");
    expect(metadata.commands[1].name).toBe("sort_lines_number");
    expect(metadata.commands[2].name).toBe("sort_lines_number_last");
    expect(metadata.commands[3].name).toBe("sort_lines_reverse");
  });
});

// Command Execution Tests
describe("Line Sort Extension - Command Execution Tests", function() {

  describe("sort_lines_alpha command", function() {
    it("should sort lines alphabetically", function() {
      var payload = {
        parameters: [],
        fullText: "zebra\napple\nbanana\ncherry",
        userSettings: {},
        preferences: {}
      };

      var result = sort_lines_alpha.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("apple\nbanana\ncherry\nzebra");
    });

    it("should sort lines in reverse alphabetical order", function() {
      var payload = {
        parameters: ["true"],
        fullText: "apple\nbanana\ncherry",
        userSettings: {},
        preferences: {}
      };

      var result = sort_lines_alpha.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("cherry\nbanana\napple");
    });

    it("should ignore first line when sorting", function() {
      var payload = {
        parameters: ["false", "true"],
        fullText: "Header Line\nzebra\napple\nbanana",
        userSettings: {},
        preferences: {}
      };

      var result = sort_lines_alpha.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Header Line\napple\nbanana\nzebra");
    });

    it("should sort case-insensitively", function() {
      var payload = {
        parameters: [],
        fullText: "Banana\napple\nCherry\nAPRICOT",
        userSettings: {},
        preferences: {}
      };

      var result = sort_lines_alpha.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("apple\nAPRICOT\nBanana\nCherry");
    });
  });

  describe("sort_lines_number command", function() {
    it("should sort lines by first number", function() {
      var payload = {
        parameters: [],
        fullText: "Item 30\nItem 5\nItem 100\nItem 2",
        userSettings: {},
        preferences: {}
      };

      var result = sort_lines_number.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Item 2\nItem 5\nItem 30\nItem 100");
    });

    it("should sort lines by first number in reverse", function() {
      var payload = {
        parameters: ["true"],
        fullText: "Item 2\nItem 5\nItem 30",
        userSettings: {},
        preferences: {}
      };

      var result = sort_lines_number.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Item 30\nItem 5\nItem 2");
    });

    it("should handle negative numbers", function() {
      var payload = {
        parameters: [],
        fullText: "Temp -5\nTemp 10\nTemp -20\nTemp 0",
        userSettings: {},
        preferences: {}
      };

      var result = sort_lines_number.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Temp -20\nTemp -5\nTemp 0\nTemp 10");
    });

    it("should handle decimal numbers", function() {
      var payload = {
        parameters: [],
        fullText: "Value 3.14\nValue 2.5\nValue 10.1\nValue 1.9",
        userSettings: {},
        preferences: {}
      };

      var result = sort_lines_number.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Value 1.9\nValue 2.5\nValue 3.14\nValue 10.1");
    });

    it("should ignore first line when sorting by number", function() {
      var payload = {
        parameters: ["false", "true"],
        fullText: "Header\nItem 30\nItem 5\nItem 100",
        userSettings: {},
        preferences: {}
      };

      var result = sort_lines_number.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Header\nItem 5\nItem 30\nItem 100");
    });

    it("should place lines without numbers at the end", function() {
      var payload = {
        parameters: [],
        fullText: "Item 5\nNo number here\nItem 2\nAlso no number",
        userSettings: {},
        preferences: {}
      };

      var result = sort_lines_number.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Item 2\nItem 5\nNo number here\nAlso no number");
    });
  });

  describe("sort_lines_number_last command", function() {
    it("should sort lines by last number", function() {
      var payload = {
        parameters: [],
        fullText: "Page 1 of 30\nPage 1 of 5\nPage 1 of 100\nPage 1 of 2",
        userSettings: {},
        preferences: {}
      };

      var result = sort_lines_number_last.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Page 1 of 2\nPage 1 of 5\nPage 1 of 30\nPage 1 of 100");
    });

    it("should sort lines by last number in reverse", function() {
      var payload = {
        parameters: ["true"],
        fullText: "Score: 10\nScore: 5\nScore: 30",
        userSettings: {},
        preferences: {}
      };

      var result = sort_lines_number_last.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Score: 30\nScore: 10\nScore: 5");
    });

    it("should ignore first line when sorting by last number", function() {
      var payload = {
        parameters: ["false", "true"],
        fullText: "Results\nScore: 30\nScore: 5\nScore: 100",
        userSettings: {},
        preferences: {}
      };

      var result = sort_lines_number_last.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Results\nScore: 5\nScore: 30\nScore: 100");
    });

    it("should use last number when multiple numbers exist", function() {
      var payload = {
        parameters: [],
        fullText: "1 item costs 50\n2 items cost 30\n3 items cost 100",
        userSettings: {},
        preferences: {}
      };

      var result = sort_lines_number_last.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("2 items cost 30\n1 item costs 50\n3 items cost 100");
    });
  });

  describe("sort_lines_reverse command", function() {
    it("should reverse line order", function() {
      var payload = {
        parameters: [],
        fullText: "First\nSecond\nThird\nFourth",
        userSettings: {},
        preferences: {}
      };

      var result = sort_lines_reverse.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Fourth\nThird\nSecond\nFirst");
    });

    it("should ignore first line when reversing", function() {
      var payload = {
        parameters: ["true"],
        fullText: "Header\nFirst\nSecond\nThird",
        userSettings: {},
        preferences: {}
      };

      var result = sort_lines_reverse.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Header\nThird\nSecond\nFirst");
    });

    it("should handle single line", function() {
      var payload = {
        parameters: [],
        fullText: "Only line",
        userSettings: {},
        preferences: {}
      };

      var result = sort_lines_reverse.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("Only line");
    });

    it("should handle empty input", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = sort_lines_reverse.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("");
    });
  });

});

// Run the tests
console.log("Running Line Sort Extension Tests...");
console.log("====================================");
