// Test file for json_tools extension
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
        throw new Error("Expected '" + expected + "' but got '" + actual + "'");
      }
    },
    toContain: function(expected) {
      if (String(actual).indexOf(expected) === -1) {
        throw new Error("Expected '" + actual + "' to contain '" + expected + "'");
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
describe("JSON Tools Extension - Metadata Validation", function() {

  it("should have required name field", function() {
    expect(metadata.name).toBeDefined();
    expect(metadata.name).toBe("json_tools");
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
    expect(metadata.category).toBe("Data Tools");
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

  it("should have preferences for key casing", function() {
    expect(metadata.preferences).toBeDefined();
    expect(metadata.preferences).toBeArray();
    expect(metadata.preferences.length).toBeGreaterThanOrEqual(1);
  });
});

// Command Execution Tests
describe("JSON Tools Extension - Command Execution Tests", function() {

  describe("csv_to_json command", function() {
    it("should convert simple CSV to JSON", function() {
      var payload = {
        parameters: [],
        fullText: "name,age,city\nJohn,30,NYC\nJane,25,LA",
        userSettings: {},
        preferences: { key_casing: "snake_case" }
      };

      var result = csv_to_json.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toContain('"name"');
      expect(result.payload).toContain('"age"');
      expect(result.payload).toContain("John");
    });

    it("should handle CSV with spaces in headers", function() {
      var payload = {
        parameters: [],
        fullText: "First Name,Last Name\nJohn,Doe",
        userSettings: {},
        preferences: { key_casing: "snake_case" }
      };

      var result = csv_to_json.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toContain("first_name");
      expect(result.payload).toContain("last_name");
    });

    it("should handle quoted fields with commas", function() {
      var payload = {
        parameters: [],
        fullText: 'name,address\nJohn,"123 Main St, NYC"',
        userSettings: {},
        preferences: { key_casing: "snake_case" }
      };

      var result = csv_to_json.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toContain("123 Main St, NYC");
    });

    it("should error on invalid CSV", function() {
      var payload = {
        parameters: [],
        fullText: "name\n",
        userSettings: {},
        preferences: {}
      };

      var result = csv_to_json.execute(payload);
      expect(result.status).toBe("error");
    });
  });

  describe("json_sort command", function() {
    it("should sort array by string key", function() {
      var payload = {
        parameters: ["name"],
        fullText: '[{"name":"Zack","age":30},{"name":"Alice","age":25}]',
        userSettings: {},
        preferences: {}
      };

      var result = json_sort.execute(payload);
      expect(result.status).toBe("success");
      var parsed = JSON.parse(result.payload);
      expect(parsed[0].name).toBe("Alice");
      expect(parsed[1].name).toBe("Zack");
    });

    it("should sort array by number key", function() {
      var payload = {
        parameters: ["age"],
        fullText: '[{"name":"John","age":30},{"name":"Jane","age":25}]',
        userSettings: {},
        preferences: {}
      };

      var result = json_sort.execute(payload);
      expect(result.status).toBe("success");
      var parsed = JSON.parse(result.payload);
      expect(parsed[0].age).toBe(25);
      expect(parsed[1].age).toBe(30);
    });

    it("should sort in reverse order", function() {
      var payload = {
        parameters: ["age", "true"],
        fullText: '[{"name":"John","age":30},{"name":"Jane","age":25}]',
        userSettings: {},
        preferences: {}
      };

      var result = json_sort.execute(payload);
      expect(result.status).toBe("success");
      var parsed = JSON.parse(result.payload);
      expect(parsed[0].age).toBe(30);
      expect(parsed[1].age).toBe(25);
    });

    it("should error if key not found", function() {
      var payload = {
        parameters: ["missing"],
        fullText: '[{"name":"John"}]',
        userSettings: {},
        preferences: {}
      };

      var result = json_sort.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("not found");
    });

    it("should error on invalid JSON", function() {
      var payload = {
        parameters: ["name"],
        fullText: 'not valid json',
        userSettings: {},
        preferences: {}
      };

      var result = json_sort.execute(payload);
      expect(result.status).toBe("error");
    });
  });

  describe("json_filter command", function() {
    it("should filter with equals operator", function() {
      var payload = {
        parameters: ["status", "=", "active"],
        fullText: '[{"id":1,"status":"active"},{"id":2,"status":"inactive"}]',
        userSettings: {},
        preferences: {}
      };

      var result = json_filter.execute(payload);
      expect(result.status).toBe("success");
      var parsed = JSON.parse(result.payload);
      expect(parsed.length).toBe(1);
      expect(parsed[0].id).toBe(1);
    });

    it("should filter with greater than operator", function() {
      var payload = {
        parameters: ["age", ">", "25"],
        fullText: '[{"name":"John","age":30},{"name":"Jane","age":25},{"name":"Bob","age":35}]',
        userSettings: {},
        preferences: {}
      };

      var result = json_filter.execute(payload);
      expect(result.status).toBe("success");
      var parsed = JSON.parse(result.payload);
      expect(parsed.length).toBe(2);
    });

    it("should filter with contains operator", function() {
      var payload = {
        parameters: ["name", "contains", "Jo"],
        fullText: '[{"name":"John"},{"name":"Jane"},{"name":"Joey"}]',
        userSettings: {},
        preferences: {}
      };

      var result = json_filter.execute(payload);
      expect(result.status).toBe("success");
      var parsed = JSON.parse(result.payload);
      expect(parsed.length).toBe(2);
    });
  });

  describe("json_filter_out command", function() {
    it("should remove matching items", function() {
      var payload = {
        parameters: ["status", "=", "deleted"],
        fullText: '[{"id":1,"status":"active"},{"id":2,"status":"deleted"}]',
        userSettings: {},
        preferences: {}
      };

      var result = json_filter_out.execute(payload);
      expect(result.status).toBe("success");
      var parsed = JSON.parse(result.payload);
      expect(parsed.length).toBe(1);
      expect(parsed[0].status).toBe("active");
    });
  });

  describe("json_add_key command", function() {
    it("should add key with string value", function() {
      var payload = {
        parameters: ["status", "active"],
        fullText: '[{"id":1},{"id":2}]',
        userSettings: {},
        preferences: {}
      };

      var result = json_add_key.execute(payload);
      expect(result.status).toBe("success");
      var parsed = JSON.parse(result.payload);
      expect(parsed[0].status).toBe("active");
      expect(parsed[1].status).toBe("active");
    });

    it("should add key with null value when empty", function() {
      var payload = {
        parameters: ["created", ""],
        fullText: '[{"id":1}]',
        userSettings: {},
        preferences: {}
      };

      var result = json_add_key.execute(payload);
      expect(result.status).toBe("success");
      var parsed = JSON.parse(result.payload);
      expect(parsed[0].created).toBe(null);
    });

    it("should parse numeric values", function() {
      var payload = {
        parameters: ["count", "0"],
        fullText: '[{"id":1}]',
        userSettings: {},
        preferences: {}
      };

      var result = json_add_key.execute(payload);
      expect(result.status).toBe("success");
      var parsed = JSON.parse(result.payload);
      expect(parsed[0].count).toBe(0);
    });
  });

  describe("json_remove_key command", function() {
    it("should remove key from all objects", function() {
      var payload = {
        parameters: ["temp"],
        fullText: '[{"id":1,"temp":"x"},{"id":2,"temp":"y"}]',
        userSettings: {},
        preferences: {}
      };

      var result = json_remove_key.execute(payload);
      expect(result.status).toBe("success");
      var parsed = JSON.parse(result.payload);
      expect(parsed[0].temp).toBe(undefined);
      expect(parsed[1].temp).toBe(undefined);
    });
  });

  describe("json_set_key command", function() {
    it("should set key to new value", function() {
      var payload = {
        parameters: ["status", "updated"],
        fullText: '[{"id":1,"status":"old"},{"id":2,"status":"old"}]',
        userSettings: {},
        preferences: {}
      };

      var result = json_set_key.execute(payload);
      expect(result.status).toBe("success");
      var parsed = JSON.parse(result.payload);
      expect(parsed[0].status).toBe("updated");
      expect(parsed[1].status).toBe("updated");
    });
  });

  describe("json_append_key command", function() {
    it("should append to existing values", function() {
      var payload = {
        parameters: ["name", " Jr."],
        fullText: '[{"name":"John"},{"name":"Bob"}]',
        userSettings: {},
        preferences: {}
      };

      var result = json_append_key.execute(payload);
      expect(result.status).toBe("success");
      var parsed = JSON.parse(result.payload);
      expect(parsed[0].name).toBe("John Jr.");
      expect(parsed[1].name).toBe("Bob Jr.");
    });
  });

  describe("json_prepend_key command", function() {
    it("should prepend to existing values", function() {
      var payload = {
        parameters: ["name", "Dr. "],
        fullText: '[{"name":"Smith"},{"name":"Jones"}]',
        userSettings: {},
        preferences: {}
      };

      var result = json_prepend_key.execute(payload);
      expect(result.status).toBe("success");
      var parsed = JSON.parse(result.payload);
      expect(parsed[0].name).toBe("Dr. Smith");
      expect(parsed[1].name).toBe("Dr. Jones");
    });
  });

  describe("json_get_dupes command", function() {
    it("should find duplicate objects by key", function() {
      var payload = {
        parameters: ["email"],
        fullText: '[{"id":1,"email":"test@test.com"},{"id":2,"email":"test@test.com"},{"id":3,"email":"other@test.com"}]',
        userSettings: {},
        preferences: {}
      };

      var result = json_get_dupes.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toContain("Duplicates Found");
      expect(result.payload).toContain("test@test.com");
    });

    it("should return message when no duplicates found", function() {
      var payload = {
        parameters: ["email"],
        fullText: '[{"id":1,"email":"a@test.com"},{"id":2,"email":"b@test.com"}]',
        userSettings: {},
        preferences: {}
      };

      var result = json_get_dupes.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toContain("No Duplicates Found");
    });

    it("should find duplicate primitives in array", function() {
      var payload = {
        parameters: [""],
        fullText: '["apple", "banana", "apple", "cherry", "banana"]',
        userSettings: {},
        preferences: {}
      };

      var result = json_get_dupes.execute(payload);
      expect(result.status).toBe("success");
      expect(result.payload).toContain("Duplicates Found");
      expect(result.payload).toContain("apple");
      expect(result.payload).toContain("banana");
    });
  });

  describe("json_dedupe command", function() {
    it("should remove exact duplicates keeping first", function() {
      var payload = {
        parameters: ["true"],
        fullText: '[{"id":1,"name":"John"},{"id":1,"name":"John"},{"id":2,"name":"Jane"}]',
        userSettings: {},
        preferences: {}
      };

      var result = json_dedupe.execute(payload);
      expect(result.status).toBe("success");
      var parsed = JSON.parse(result.payload);
      expect(parsed.length).toBe(2);
    });

    it("should remove exact duplicates keeping last", function() {
      var payload = {
        parameters: ["false"],
        fullText: '[{"id":1,"name":"John"},{"id":1,"name":"John"},{"id":2,"name":"Jane"}]',
        userSettings: {},
        preferences: {}
      };

      var result = json_dedupe.execute(payload);
      expect(result.status).toBe("success");
      var parsed = JSON.parse(result.payload);
      expect(parsed.length).toBe(2);
    });
  });

  describe("json_sort_array command", function() {
    it("should sort array of numbers", function() {
      var payload = {
        parameters: [],
        fullText: '[3, 1, 4, 1, 5, 9, 2, 6]',
        userSettings: {},
        preferences: {}
      };

      var result = json_sort_array.execute(payload);
      expect(result.status).toBe("success");
      var parsed = JSON.parse(result.payload);
      expect(parsed[0]).toBe(1);
      expect(parsed[parsed.length - 1]).toBe(9);
    });

    it("should sort array of strings", function() {
      var payload = {
        parameters: [],
        fullText: '["zebra", "apple", "banana"]',
        userSettings: {},
        preferences: {}
      };

      var result = json_sort_array.execute(payload);
      expect(result.status).toBe("success");
      var parsed = JSON.parse(result.payload);
      expect(parsed[0]).toBe("apple");
      expect(parsed[2]).toBe("zebra");
    });

    it("should sort in reverse order", function() {
      var payload = {
        parameters: ["true"],
        fullText: '[1, 2, 3]',
        userSettings: {},
        preferences: {}
      };

      var result = json_sort_array.execute(payload);
      expect(result.status).toBe("success");
      var parsed = JSON.parse(result.payload);
      expect(parsed[0]).toBe(3);
      expect(parsed[2]).toBe(1);
    });

    it("should error on array of objects", function() {
      var payload = {
        parameters: [],
        fullText: '[{"id":1}]',
        userSettings: {},
        preferences: {}
      };

      var result = json_sort_array.execute(payload);
      expect(result.status).toBe("error");
      expect(result.message).toContain("contains objects");
    });
  });
});

// Run the tests
console.log("Running JSON Tools Extension Tests...");
console.log("=====================================");
