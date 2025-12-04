// Test file for business extension

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
    },
    toBeCloseTo: function(expected, precision) {
      var pow = Math.pow(10, precision);
      if (Math.abs(actual - expected) >= 0.5 / pow) {
        throw new Error("Expected " + actual + " to be close to " + expected);
      }
    }
  };
}

const extensionPath = __dirname;
const metadataPath = path.join(extensionPath, 'extension.json');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

// Load the extension files in order
eval(fs.readFileSync(path.join(extensionPath, 'index.js'), 'utf8'));
eval(fs.readFileSync(path.join(extensionPath, 'helpers/statistics.js'), 'utf8'));
eval(fs.readFileSync(path.join(extensionPath, 'commands/growth.js'), 'utf8'));
eval(fs.readFileSync(path.join(extensionPath, 'commands/forecast.js'), 'utf8'));
eval(fs.readFileSync(path.join(extensionPath, 'commands/templates.js'), 'utf8'));

// Access commands from global scope
const Stats = global.__EXTENSION_SHARED__.business.shared.Statistics;

describe("Business Extension - Metadata Validation", function() {
  it("should have correct extension name", function() {
    expect(metadata.name).toBe("business");
  });

  it("should have 11 commands", function() {
    expect(metadata.commands.length).toBe(11);
  });

  it("should have multi-file structure", function() {
    expect(metadata.files.length).toBe(5);
  });

  it("should have correct category", function() {
    expect(metadata.category).toBe("Business & Analytics");
  });

  it("should have full dataScope", function() {
    expect(metadata.dataScope).toBe("full");
  });
});

describe("Business Extension - Statistics Helpers", function() {
  it("should calculate percentage change correctly", function() {
    expect(Stats.percentageChange(100, 150)).toBe(0.5); // 50% increase
    expect(Stats.percentageChange(100, 50)).toBe(-0.5); // 50% decrease
  });

  it("should calculate mean correctly", function() {
    expect(Stats.mean([1, 2, 3, 4, 5])).toBe(3);
    expect(Stats.mean([10, 20, 30])).toBe(20);
  });

  it("should format percentages correctly", function() {
    expect(Stats.formatPercent(0.1234, 2)).toBe("12.34%");
    expect(Stats.formatPercent(0.5, 1)).toBe("50.0%");
  });

  it("should format numbers with commas", function() {
    expect(Stats.formatNumber(1234.56, 2)).toBe("1,234.56");
    expect(Stats.formatNumber(1000000, 0)).toBe("1,000,000");
  });

  it("should calculate linear regression", function() {
    const values = [1, 2, 3, 4, 5];
    const regression = Stats.linearRegression(values);
    expect(regression.slope).toBeCloseTo(1, 1);
    expect(regression.intercept).toBeCloseTo(1, 1);
  });
});

describe("Business Extension - Growth Command", function() {
  it("should calculate growth between consecutive numbers", function() {
    var result = growth.execute({
      parameters: [],
      fullText: "10, 30, 80",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("success");
    expect(result.payload).toContain("10.00 → 30.00");
    expect(result.payload).toContain("30.00 → 80.00");
  });

  it("should handle space-separated numbers", function() {
    var result = growth.execute({
      parameters: [],
      fullText: "Revenue: 100 150 200 250",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("success");
    expect(result.payload).toContain("100.00 → 150.00");
  });

  it("should handle line-separated numbers", function() {
    var result = growth.execute({
      parameters: [],
      fullText: "Jan: 100\nFeb: 120\nMar: 150",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("success");
    expect(result.payload).toContain("100.00 → 120.00");
  });

  it("should calculate average growth rate", function() {
    var result = growth.execute({
      parameters: [],
      fullText: "100, 110, 121",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("success");
    expect(result.payload).toContain("100.00 → 110.00");
  });

  it("should error with insufficient numbers", function() {
    var result = growth.execute({
      parameters: [],
      fullText: "100",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("error");
    expect(result.message).toContain("Need at least 2 numbers");
  });
});

describe("Business Extension - Forecast Command", function() {
  it("should forecast future values", function() {
    var result = forecast.execute({
      parameters: ["3"],
      fullText: "100, 110, 120, 130",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("success");
    expect(result.payload).toContain("140.00");
    expect(result.payload).toContain("lower:");
    expect(result.payload).toContain("upper:");
  });

  it("should use default forecast period", function() {
    var result = forecast.execute({
      parameters: [],
      fullText: "10, 20, 30, 40",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("success");
    expect(result.payload).toContain("50.00");
  });

  it("should identify upward trend", function() {
    var result = forecast.execute({
      parameters: ["2"],
      fullText: "50, 60, 70, 80, 90",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("success");
    expect(result.payload).toContain("100.00");
  });

  it("should error with insufficient data", function() {
    var result = forecast.execute({
      parameters: ["3"],
      fullText: "100",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("error");
    expect(result.message).toContain("Need at least 2 historical values");
  });
});

describe("Business Extension - Template Commands", function() {
  it("should insert CAC template", function() {
    var result = cac.execute({
      parameters: [],
      fullText: "",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("success");
    expect(result.payload).toContain("math");
    expect(result.payload).toContain("Customer Acquisition Cost");
    expect(result.payload).toContain("marketing_spend");
    expect(result.payload).toContain("cac =");
  });

  it("should calculate A/B test significance", function() {
    var result = ab_test.execute({
      parameters: ["250", "10000", "300", "10000"],
      fullText: "",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("success");
    expect(result.payload).toContain("A/B Test Results");
    expect(result.payload).toContain("Conversion Rates");
    expect(result.payload).toContain("A (Control)");
    expect(result.payload).toContain("B (Treatment)");
    expect(result.payload).toContain("Confidence Level");
    expect(result.payload).toContain("p-value");
  });

  it("should detect statistically significant difference", function() {
    // Large difference with large sample sizes should be significant
    var result = ab_test.execute({
      parameters: ["100", "10000", "200", "10000"],
      fullText: "",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("success");
    expect(result.payload).toContain("Winner: Variant B");
  });

  it("should detect non-significant results", function() {
    // Small difference with small sample sizes
    var result = ab_test.execute({
      parameters: ["10", "100", "12", "100"],
      fullText: "",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("success");
    expect(result.payload).toContain("Not Significant");
  });

  it("should accept custom confidence level", function() {
    var result = ab_test.execute({
      parameters: ["250", "10000", "300", "10000", "0.99"],
      fullText: "",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("success");
    expect(result.payload).toContain("99%");
  });

  it("should validate ab_test inputs", function() {
    var result = ab_test.execute({
      parameters: ["100", "50", "100", "100"],  // conversions > sample size
      fullText: "",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("error");
  });

  it("should calculate sample size for A/B test", function() {
    var result = sample_size.execute({
      parameters: ["250", "10000", "0.1"],
      fullText: "",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("success");
    expect(result.payload).toContain("Sample Size Calculator Results");
    expect(result.payload).toContain("Baseline Conversion Rate");
    expect(result.payload).toContain("Per Variant");
    expect(result.payload).toContain("Total (Both Variants)");
  });

  it("should calculate sample size with custom confidence", function() {
    var result = sample_size.execute({
      parameters: ["250", "10000", "0.1", "0.99"],
      fullText: "",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("success");
    expect(result.payload).toContain("99%");
  });

  it("should validate sample_size inputs", function() {
    var result = sample_size.execute({
      parameters: ["250", "10000", "-0.1"],  // negative lift
      fullText: "",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("error");
  });

  it("should insert retention/churn template", function() {
    var result = retention_churn.execute({
      parameters: [],
      fullText: "",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("success");
    expect(result.payload).toContain("math");
    expect(result.payload).toContain("Retention & Churn");
    expect(result.payload).toContain("monthly_churn_rate");
    expect(result.payload).toContain("average_lifetime_months");
  });

  it("should insert LTV template", function() {
    var result = ltv.execute({
      parameters: [],
      fullText: "",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("success");
    expect(result.payload).toContain("math");
    expect(result.payload).toContain("Customer Lifetime Value");
    expect(result.payload).toContain("ltv_simple");
    expect(result.payload).toContain("ltv_to_cac_ratio");
  });

  it("should insert ARPU template", function() {
    var result = arpu.execute({
      parameters: [],
      fullText: "",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("success");
    expect(result.payload).toContain("math");
    expect(result.payload).toContain("ARPU");
    expect(result.payload).toContain("total_revenue");
    expect(result.payload).toContain("total_users");
  });

  it("should insert ARPPU template", function() {
    var result = arppu.execute({
      parameters: [],
      fullText: "",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("success");
    expect(result.payload).toContain("math");
    expect(result.payload).toContain("ARPPU");
    expect(result.payload).toContain("paying_users");
    expect(result.payload).toContain("conversion_rate");
  });

  it("should insert runway template", function() {
    var result = runway.execute({
      parameters: [],
      fullText: "",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("success");
    expect(result.payload).toContain("math");
    expect(result.payload).toContain("Cash Runway");
    expect(result.payload).toContain("monthly_burn");
    expect(result.payload).toContain("months_of_runway");
  });

  it("should insert SaaS pricing template", function() {
    var result = saas_pricing.execute({
      parameters: [],
      fullText: "",
      userSettings: {},
      preferences: {}
    });
    expect(result.status).toBe("success");
    expect(result.payload).toContain("math");
    expect(result.payload).toContain("SaaS Pricing");
    expect(result.payload).toContain("basic_price");
    expect(result.payload).toContain("pro_price");
    expect(result.payload).toContain("enterprise_price");
  });
});

describe("Business Extension - Command Metadata", function() {
  it("should have growth command metadata", function() {
    const cmd = metadata.commands.find(c => c.name === "growth");
    expect(cmd).toBeDefined();
    expect(cmd.type).toBe("insert");
  });

  it("should have forecast command metadata", function() {
    const cmd = metadata.commands.find(c => c.name === "forecast");
    expect(cmd).toBeDefined();
    expect(cmd.type).toBe("insert");
  });

  it("should have all template commands", function() {
    const templates = ["cac", "ab_test", "sample_size", "retention_churn", "ltv", "arpu", "arppu", "runway", "saas_pricing"];
    templates.forEach(name => {
      const cmd = metadata.commands.find(c => c.name === name);
      expect(cmd).toBeDefined();
      expect(cmd.type).toBe("insert");
    });
  });
});
