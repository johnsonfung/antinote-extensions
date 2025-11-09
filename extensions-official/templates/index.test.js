// Test file for templates extension
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
describe("Templates Extension - Metadata Validation", function() {

  it("should have required name field", function() {
    expect(metadata.name).toBeDefined();
    expect(metadata.name).toBe("templates");
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
    expect(metadata.category).toBe("Productivity");
  });

  it("should have required dataScope field", function() {
    expect(metadata.dataScope).toBeDefined();
    expect(metadata.dataScope).toBe("none");
  });

  it("should have empty endpoints array", function() {
    expect(metadata.endpoints).toBeDefined();
    expect(metadata.endpoints).toBeArray();
    expect(metadata.endpoints.length).toBe(0);
  });

  it("should have empty requiredAPIKeys array", function() {
    expect(metadata.requiredAPIKeys).toBeDefined();
    expect(metadata.requiredAPIKeys).toBeArray();
    expect(metadata.requiredAPIKeys.length).toBe(0);
  });

  it("should have commands array with 16 commands", function() {
    expect(metadata.commands).toBeDefined();
    expect(metadata.commands).toBeArray();
    expect(metadata.commands.length).toBe(16);
  });

  it("should have all template commands", function() {
    var commandNames = metadata.commands.map(function(cmd) { return cmd.name; });
    expect(commandNames.indexOf("todo")).toBeGreaterThanOrEqual(0);
    expect(commandNames.indexOf("bullet")).toBeGreaterThanOrEqual(0);
    expect(commandNames.indexOf("sorry")).toBeGreaterThanOrEqual(0);
    expect(commandNames.indexOf("reflect")).toBeGreaterThanOrEqual(0);
    expect(commandNames.indexOf("standup")).toBeGreaterThanOrEqual(0);
    expect(commandNames.indexOf("one_on_one")).toBeGreaterThanOrEqual(0);
    expect(commandNames.indexOf("custom_template_1")).toBeGreaterThanOrEqual(0);
    expect(commandNames.indexOf("custom_template_2")).toBeGreaterThanOrEqual(0);
    expect(commandNames.indexOf("custom_template_3")).toBeGreaterThanOrEqual(0);
    expect(commandNames.indexOf("custom_template_4")).toBeGreaterThanOrEqual(0);
    expect(commandNames.indexOf("custom_template_5")).toBeGreaterThanOrEqual(0);
    expect(commandNames.indexOf("custom_template_6")).toBeGreaterThanOrEqual(0);
    expect(commandNames.indexOf("custom_template_7")).toBeGreaterThanOrEqual(0);
    expect(commandNames.indexOf("custom_template_8")).toBeGreaterThanOrEqual(0);
    expect(commandNames.indexOf("custom_template_9")).toBeGreaterThanOrEqual(0);
    expect(commandNames.indexOf("custom_template_10")).toBeGreaterThanOrEqual(0);
  });

  it("should have all commands with insert type", function() {
    metadata.commands.forEach(function(cmd) {
      expect(cmd.type).toBe("insert");
    });
  });
});

// Tests for command execution
describe("Templates Extension - Command Execution Tests", function() {

  describe("::todo command", function() {
    it("should return success status", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = todo.execute(payload);
      expect(result.status).toBe("success");
    });

    it("should insert GSD framework template", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = todo.execute(payload);
      expect(result.payload).toContain("list:To-Do");
      expect(result.payload).toContain("# Goals");
      expect(result.payload).toContain("# Schedule");
      expect(result.payload).toContain("# Do");
    });

    it("should include current date", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = todo.execute(payload);
      // Should contain a date (at minimum a comma for date formatting)
      expect(result.payload).toContain(",");
    });
  });

  describe("::bullet command", function() {
    it("should return success status", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = bullet.execute(payload);
      expect(result.status).toBe("success");
    });

    it("should insert bullet journal sections", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = bullet.execute(payload);
      expect(result.payload).toContain("## Tasks");
      expect(result.payload).toContain("## Events");
      expect(result.payload).toContain("## Notes");
      expect(result.payload).toContain("## Priorities");
    });
  });

  describe("::sorry command", function() {
    it("should return success status", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = sorry.execute(payload);
      expect(result.status).toBe("success");
    });

    it("should insert apology template with placeholders", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = sorry.execute(payload);
      expect(result.payload).toContain("[Name]");
      expect(result.payload).toContain("apologize");
      expect(result.payload).toContain("Moving forward");
    });
  });

  describe("::reflect command", function() {
    it("should return success status", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = reflect.execute(payload);
      expect(result.status).toBe("success");
    });

    it("should insert reflection prompts", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = reflect.execute(payload);
      expect(result.payload).toContain("What went well");
      expect(result.payload).toContain("What could have gone better");
      expect(result.payload).toContain("What did I learn");
      expect(result.payload).toContain("grateful");
    });
  });

  describe("::standup command", function() {
    it("should return success status", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = standup.execute(payload);
      expect(result.status).toBe("success");
    });

    it("should insert standup sections", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = standup.execute(payload);
      expect(result.payload).toContain("## Yesterday");
      expect(result.payload).toContain("## Today");
      expect(result.payload).toContain("## Blockers");
    });
  });

  describe("::one_on_one command", function() {
    it("should return success status", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = one_on_one.execute(payload);
      expect(result.status).toBe("success");
    });

    it("should insert 1:1 meeting sections", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = one_on_one.execute(payload);
      expect(result.payload).toContain("## My Updates");
      expect(result.payload).toContain("## Discussion Topics");
      expect(result.payload).toContain("## Feedback Requested");
      expect(result.payload).toContain("## Career Development");
      expect(result.payload).toContain("## Action Items");
    });
  });

  describe("custom_template_1 command", function() {
    it("should return error when template is not configured", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = custom_template_1.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("not configured");
    });
  });

  describe("custom_template_2 command", function() {
    it("should return error when template is not configured", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = custom_template_2.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("not configured");
    });
  });

  describe("custom_template_3 command", function() {
    it("should return error when template is not configured", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = custom_template_3.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("not configured");
    });
  });

  describe("custom_template_4 command", function() {
    it("should return error when template is not configured", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = custom_template_4.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("not configured");
    });
  });

  describe("custom_template_5 command", function() {
    it("should return error when template is not configured", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = custom_template_5.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("not configured");
    });
  });

  describe("custom_template_6 command", function() {
    it("should return error when template is not configured", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = custom_template_6.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("not configured");
    });
  });

  describe("custom_template_7 command", function() {
    it("should return error when template is not configured", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = custom_template_7.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("not configured");
    });
  });

  describe("custom_template_8 command", function() {
    it("should return error when template is not configured", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = custom_template_8.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("not configured");
    });
  });

  describe("custom_template_9 command", function() {
    it("should return error when template is not configured", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = custom_template_9.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("not configured");
    });
  });

  describe("custom_template_10 command", function() {
    it("should return error when template is not configured", function() {
      var payload = {
        parameters: [],
        fullText: "",
        userSettings: {},
        preferences: {}
      };

      var result = custom_template_10.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("not configured");
    });
  });
});

console.log("\nRunning Templates Extension Tests...");
console.log("======================================\n");
