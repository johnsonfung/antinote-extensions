// Extension test for currency conversion
// by @adityagaurkar

// mock API resposnse
global.callAPI = function() {
  return {
    data: JSON.stringify({
      rates: {
        EUR: 0.9
      }
    })
  };
};

global.ReturnObject = function(obj) {
  return obj;
};

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
        expect(metadata.name).toBe('Currency Converter');
    });

    it('should have version field metadata', function() {
        expect(metadata.version).toBeDefined();
        expect(metadata.version).toBe('1.0.0');
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
        expect(metadata.endpoints).toBe(["https://api.frankfurter.dev/v1"]);
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
            expect(result.payload).toBe("90 EUR"); //check if conversion is happening
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