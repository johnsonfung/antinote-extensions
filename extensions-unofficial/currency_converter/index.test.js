// Extension test for currency conversion
// by @adityagaurkar

//load extension metadata
var fs = require('fs');

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

//load extension metadata
var fs  = require('fs');
var path = require('path');

//check metadata
var metadataPath = path.join(__dirname, 'extension.json');
var metadataContent = fs.readFileSync(metadataPath, 'utf8');
var metadata = JSON.parse(metadataContent);

describe ('Currency Converter Extension', function() {

    it('should have name field metadata', function() {
        expect(metadata.name).toBeDefined();
        expect(metadata.name).toBe('currency_converter');
    });

    it('should have version field metadata', function() {
        expect(metadata.version).toBeDefined();
        expect(metadata.version).toBe('1.0.1');
    });

    it('should have author name field metadata', function() {
        expect(metadata.author).toBeDefined();
        expect(metadata.author).toBe('Aditya Gaurkar');
    });

    it('should have category field metadata', function() {
        expect(metadata.category).toBeDefined();
        expect(metadata.category).toBe('Utility');
    });

    it("should have required dataScope field", function() {
    expect(metadata.dataScope).toBeDefined();
    expect(metadata.dataScope).toBe("none");
    });

    it('should have api endpoint field metadata', function() {
        expect(metadata.endpoints).toBeDefined();
        expect(metadata.endpoints).toBeArray();
        expect(metadata.endpoints[0]).toBe("https://api.frankfurter.dev/v1");
    });

    it('should have api keys field metadata', function() {
        expect(metadata.requiredAPIKeys).toBeDefined();
        expect(metadata.requiredAPIKeys).toBeArray();
    });

    it("should have 1 command", function() {
        expect(metadata.commands).toBeDefined();
        expect(metadata.commands).toBeArray();
        expect(metadata.commands.length).toBe(1);
    });
});

//extension tests

describe("Currency Converter Functionality", function() {

    describe("fx command returns correct conversion", function() {
        it("should convert currency correctly", function() {
            var payload = {
                parameters: [100, "USD", "EUR"]
            };

            var result = fx.execute(payload);
            expect(result.status).toBe("success");
            expect(result.payload).toBeDefined(); //check if conversion is happening
        });
    });
    
    describe("fx command fails when its the same currency", function() {
        it("should fail when currencies are the same", function() {
            var payload = {
                parameters: [100, "USD", "USD"]
            };

            var result = fx.execute(payload);
            expect(result.status).toBe("error");
        });
    });
});

//run tests
console.log("Running Currency Converter Extension Tests...");
console.log("======================================");