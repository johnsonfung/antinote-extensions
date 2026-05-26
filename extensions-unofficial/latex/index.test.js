// Test file for latex extension
// This file tests both the extension metadata and command execution

var fs = require('fs');
var path = require('path');

// Mock test framework functions
function describe(name, fn) {
  console.log("\n" + name);
  fn();
}

// Custom it function
function it(name, fn) {
  try {
    fn();
    console.log("  ✓ " + name);
  } catch (e) {
    console.log("  ✗ " + name);
    console.log("    Error: " + e.message);
  }
}

// Custom expect function
function expect(actual) {
  return {
    toBe: function(expected) {
      if (actual !== expected) {
        throw new Error("Expected '" + expected + "' but got '" + actual + "'");
      }
    },
    toContain: function(expected) {
      if (actual.indexOf(expected) === -1) {
        throw new Error("Expected '" + actual + "' to contain '" + expected + "'");
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
describe("LaTeX Extension - Metadata Validation", function() {

  it("should have required name field", function() {
    expect(metadata.name).toBeDefined();
    expect(metadata.name).toBe("latex");
  });

  it("should have required version field", function() {
    expect(metadata.version).toBeDefined();
    expect(metadata.version).toBe("1.0.1");
  });

  it("should have required category field", function() {
    expect(metadata.category).toBeDefined();
    expect(metadata.category).toBe("Formatting");
  });

  it("should have required dataScope field", function() {
    expect(metadata.dataScope).toBeDefined();
    expect(metadata.dataScope).toBe("full");
  });

  it("should have the expected commands", function() {
    expect(metadata.commands).toBeDefined();
    expect(metadata.commands).toBeArray();
    expect(metadata.commands.length).toBe(2);
    expect(metadata.commands[0].name).toBe("latex");
    expect(metadata.commands[1].name).toBe("latex_note");
  });
});

describe("LaTeX Extension - Command Execution Tests", function() {

  describe("latex command", function() {
    it("should format symbols with backslashes and ignore those without", function() {
      var payload = {
        parameters: ["forall without backslash"],
        fullText: "::latex(\\forall x \\exists \\land \\bigwedge \\delta and forall without backslash)",
        userSettings: {},
        preferences: {}
      };

      var result = latex.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("∀ x ∃ ∧ ⋀ δ and forall without backslash");
    });

    it("should format superscripts and subscripts", function() {
      var payload = {
        parameters: ["x^2 + y_i = z_{n+1}"],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = latex.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("x² + yᵢ = zₙ₊₁");
    });

    it("should format fractions and square roots", function() {
      var payload = {
        parameters: ["\\frac{a}{b} + \\sqrt{x} + \\sqrt{16}"],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = latex.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("(a)/(b) + √(x) + √(16)");
    });

    it("should format summation and product ranges with parentheses", function() {
      var payload = {
        parameters: ["\\sum_{n=0}^{10} + \\sum_{i=1}^{\\infty} + \\sum_{i=1} + \\prod_{n=1}^{5} + \\sum"],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = latex.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("∑(n=0 → 10) + ∑(i=1 → ∞) + ∑(i=1) + ∏(n=1 → 5) + ∑");
    });

    it("should handle nested parentheses in latex command without cutoff", function() {
      var payload = {
        parameters: ["f(x) = y"],
        fullText: "::latex(f(x) = y)",
        userSettings: {},
        preferences: {}
      };

      var result = latex.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("f(x) = y");
    });
  });

  describe("latex_note command", function() {
    it("should replace bracketed expressions and parse them (Toggle On)", function() {
      var payload = {
        parameters: [],
        fullText: "The result is [\\forall x \\exists \\land \\bigwedge \\delta].",
        userSettings: {},
        preferences: {}
      };

      var result = latex_note.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("The result is $∀ x ∃ ∧ ⋀ δ$.");
    });

    it("should format nested brackets in latex_note command (Toggle On)", function() {
      var payload = {
        parameters: [],
        fullText: "The equation is [A \\cup [B \\cap C]].",
        userSettings: {},
        preferences: {}
      };

      var result = latex_note.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("The equation is $A ∪ [B ∩ C]$.");
    });

    it("should wrap entire note in block delimiters and parse it when no brackets are present (Toggle On)", function() {
      var payload = {
        parameters: [],
        fullText: "x^2 + y_i",
        userSettings: {},
        preferences: {}
      };

      var result = latex_note.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("$$\nx² + yᵢ\n$$");
    });

    it("should unwrap text if it is already block-wrapped (Toggle Off)", function() {
      var payload = {
        parameters: [],
        fullText: "$$\nx² + yᵢ\n$$",
        userSettings: {},
        preferences: {}
      };

      var result = latex_note.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("x² + yᵢ");
    });

    it("should convert inline LaTeX back to brackets (Toggle Off)", function() {
      var payload = {
        parameters: [],
        fullText: "The result is $∀ x ∃ ∧ ⋀ δ$.",
        userSettings: {},
        preferences: {}
      };

      var result = latex_note.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toBe("The result is [∀ x ∃ ∧ ⋀ δ].");
    });
  });
});

console.log("Running LaTeX Extension Tests...");
console.log("=========================================");
