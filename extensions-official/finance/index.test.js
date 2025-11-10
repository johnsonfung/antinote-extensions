// Test file for finance extension

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
    toContain: function(expected) {
      if (typeof actual === 'string' && actual.indexOf(expected) === -1) {
        throw new Error("Expected string to contain: " + expected);
      } else if (Array.isArray(actual) && actual.indexOf(expected) === -1) {
        throw new Error("Expected array to contain: " + expected);
      }
    },
    toBeDefined: function() {
      if (actual === undefined || actual === null) {
        throw new Error("Expected value to be defined");
      }
    },
    toBeArray: function() {
      if (!Array.isArray(actual)) {
        throw new Error("Expected value to be an array");
      }
    }
  };
}

// Load metadata
var metadataPath = path.join(__dirname, 'extension.json');
var metadataContent = fs.readFileSync(metadataPath, 'utf8');
var metadata = JSON.parse(metadataContent);

// Metadata validation tests
describe("Finance Extension - Metadata Validation", function() {

  it("should have valid metadata", function() {
    expect(metadata.name).toBe("finance");
    expect(metadata.version).toBeDefined();
    expect(metadata.author).toBeDefined();
    expect(metadata.category).toBeDefined();
    expect(metadata.dataScope).toBe("none");
  });

  it("should have 8 commands", function() {
    expect(metadata.commands).toBeDefined();
    expect(metadata.commands).toBeArray();
    expect(metadata.commands.length).toBe(8);
  });

  it("should have multi-file structure", function() {
    expect(metadata.files).toBeDefined();
    expect(metadata.files).toBeArray();
    expect(metadata.files.length).toBe(6);
    expect(metadata.files[0]).toBe("index.js");
  });

  it("should include all expected commands", function() {
    var commandNames = metadata.commands.map(function(cmd) { return cmd.name; });
    expect(commandNames).toContain("loan");
    expect(commandNames).toContain("mortgage");
    expect(commandNames).toContain("investment");
    expect(commandNames).toContain("fire_amount");
    expect(commandNames).toContain("fire_plan");
    expect(commandNames).toContain("pv");
    expect(commandNames).toContain("fv");
    expect(commandNames).toContain("tax");
  });
});

// Command execution tests
describe("Finance Extension - Command Execution Tests", function() {

  describe("loan command", function() {
    it("should calculate loan payment and amortization", function() {
      var result = loan.execute({
        parameters: ["10000", "12", "5"],
        fullText: "",
        userSettings: {},
        preferences: {}
      });
      expect(result.status).toBe("success");
      expect(result.payload).toContain("Loan Analysis");
      expect(result.payload).toContain("Monthly Payment");
      expect(result.payload).toContain("Total Interest");
      expect(result.payload).toContain("Amortization Schedule");
    });

    it("should reject invalid inputs", function() {
      var result = loan.execute({
        parameters: ["0", "12", "5"],
        fullText: "",
        userSettings: {},
        preferences: {}
      });
      expect(result.status).toBe("error");
    });
  });

  describe("mortgage command", function() {
    it("should calculate mortgage with down payment", function() {
      var result = mortgage.execute({
        parameters: ["400000", "80000", "6.5", "30"],
        fullText: "",
        userSettings: {},
        preferences: {}
      });
      expect(result.status).toBe("success");
      expect(result.payload).toContain("Mortgage Analysis");
      expect(result.payload).toContain("Monthly Payment");
      expect(result.payload).toContain("Down Payment");
    });

    it("should warn about PMI with less than 20% down", function() {
      var result = mortgage.execute({
        parameters: ["400000", "40000", "6.5", "30"],
        fullText: "",
        userSettings: {},
        preferences: {}
      });
      expect(result.status).toBe("success");
      expect(result.payload).toContain("PMI");
    });
  });

  describe("investment command", function() {
    it("should calculate investment growth", function() {
      var result = investment.execute({
        parameters: ["10000", "5000", "500", "7", "30", "0", "0", "3"],
        fullText: "",
        userSettings: {},
        preferences: {}
      });
      expect(result.status).toBe("success");
      expect(result.payload).toContain("Investment Analysis");
      expect(result.payload).toContain("Total Contributions");
      expect(result.payload).toContain("Total Gains");
    });
  });

  describe("fire_amount command", function() {
    it("should calculate FIRE income", function() {
      var result = fire_amount.execute({
        parameters: ["1000000", "4"],
        fullText: "",
        userSettings: {},
        preferences: {}
      });
      expect(result.status).toBe("success");
      expect(result.payload).toContain("FIRE Income Analysis");
      expect(result.payload).toContain("Annual Income");
    });
  });

  describe("fire_plan command", function() {
    it("should calculate path to FIRE", function() {
      var result = fire_plan.execute({
        parameters: ["100000", "3000", "5000", "7", "4", "3"],
        fullText: "",
        userSettings: {},
        preferences: {}
      });
      expect(result.status).toBe("success");
      expect(result.payload).toContain("FIRE Plan");
      expect(result.payload).toContain("Years Until Financial Independence");
    });
  });

  describe("pv command", function() {
    it("should calculate present value", function() {
      var result = pv.execute({
        parameters: ["100000", "10", "4"],
        fullText: "",
        userSettings: {},
        preferences: {}
      });
      expect(result.status).toBe("success");
      expect(result.payload).toContain("Present Value Analysis");
    });
  });

  describe("fv command", function() {
    it("should calculate future value", function() {
      var result = fv.execute({
        parameters: ["10000", "10", "4"],
        fullText: "",
        userSettings: {},
        preferences: {}
      });
      expect(result.status).toBe("success");
      expect(result.payload).toContain("Future Value Analysis");
      expect(result.payload).toContain("Rule of 72");
    });
  });

  describe("tax command", function() {
    it("should calculate tax and after-tax amount", function() {
      var result = tax.execute({
        parameters: ["100000", "22"],
        fullText: "",
        userSettings: {},
        preferences: {}
      });
      expect(result.status).toBe("success");
      expect(result.payload).toContain("Tax Calculation");
      expect(result.payload).toContain("After-Tax Amount");
    });
  });
});

console.log("Running Finance Extension Tests...");
console.log("===================================");
