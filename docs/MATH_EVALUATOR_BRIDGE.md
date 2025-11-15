# Math Expression Evaluator Bridge

## Overview

This document describes how to expose your Swift math expression evaluator to JavaScript extensions through a bridge interface, similar to the existing API bridge.

## Swift Implementation

### 1. Create Math Evaluator Bridge Protocol

```swift
// MathEvaluatorBridge.swift

import Foundation

protocol MathEvaluatorBridge {
    func evaluateExpression(_ expression: String) -> MathEvaluationResult
}

struct MathEvaluationResult: Codable {
    let success: Bool
    let value: Double?
    let error: String?

    init(value: Double) {
        self.success = true
        self.value = value
        self.error = nil
    }

    init(error: String) {
        self.success = false
        self.value = nil
        self.error = error
    }
}
```

### 2. Implement the Bridge

```swift
// MathEvaluatorBridgeImpl.swift

import Foundation

class MathEvaluatorBridgeImpl: MathEvaluatorBridge {

    // Your existing math evaluator
    private let mathEvaluator: YourMathEvaluator

    init(mathEvaluator: YourMathEvaluator) {
        self.mathEvaluator = mathEvaluator
    }

    func evaluateExpression(_ expression: String) -> MathEvaluationResult {
        do {
            let result = try mathEvaluator.evaluate(expression)
            return MathEvaluationResult(value: result)
        } catch let error as MathEvaluationError {
            return MathEvaluationResult(error: error.localizedDescription)
        } catch {
            return MathEvaluationResult(error: "Unknown evaluation error")
        }
    }
}
```

### 3. Expose to JavaScript Context

```swift
// In your JSContext setup (likely in ExtensionManager or similar)

func setupMathBridge(in context: JSContext) {
    let mathBridge = MathEvaluatorBridgeImpl(mathEvaluator: yourMathEvaluator)

    // Create the bridge function
    let evaluateMathExpression: @convention(block) (String) -> [String: Any] = { expression in
        let result = mathBridge.evaluateExpression(expression)

        var dict: [String: Any] = [
            "success": result.success
        ]

        if let value = result.value {
            dict["value"] = value
        }

        if let error = result.error {
            dict["error"] = error
        }

        return dict
    }

    // Expose to JavaScript
    context.setObject(evaluateMathExpression,
                     forKeyedSubscript: "__evaluateMathExpression" as NSString)
}
```

### 4. Call During Extension Initialization

```swift
// When setting up your extension context
let context = JSContext()!

// ... other setup ...

setupMathBridge(in: context)

// ... load extensions ...
```

## JavaScript Interface

### Base Math Utility (Create in antinote-extensions-base.js)

Add this to your base utilities that all extensions have access to:

```javascript
// Math Expression Evaluator Bridge
const MathEvaluator = {
  /**
   * Evaluate a math expression string
   * @param {string} expression - The math expression to evaluate (e.g., "5 + 3 * 2", "0.05/12")
   * @returns {number} The evaluated result
   * @throws {Error} If evaluation fails
   */
  eval: function(expression) {
    if (typeof __evaluateMathExpression === 'undefined') {
      throw new Error('Math evaluator bridge not available');
    }

    const result = __evaluateMathExpression(expression);

    if (!result.success) {
      throw new Error(result.error || 'Math evaluation failed');
    }

    return result.value;
  },

  /**
   * Safely evaluate a math expression, returning a default value on error
   * @param {string} expression - The math expression to evaluate
   * @param {number} defaultValue - Value to return if evaluation fails
   * @returns {number} The evaluated result or default value
   */
  evalSafe: function(expression, defaultValue = 0) {
    try {
      return this.eval(expression);
    } catch (error) {
      return defaultValue;
    }
  },

  /**
   * Check if a string looks like a math expression
   * @param {string} str - The string to check
   * @returns {boolean} True if it contains math operators
   */
  isMathExpression: function(str) {
    if (typeof str !== 'string') return false;
    // Contains operators but isn't just a number
    return /[+\-*/()^%]/.test(str) && !/^\s*-?\d+\.?\d*\s*$/.test(str);
  },

  /**
   * Parse a parameter that could be a number or math expression
   * @param {string|number} value - The value to parse
   * @returns {number} The parsed/evaluated number
   */
  parseNumeric: function(value) {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return parseFloat(value) || 0;

    // If it looks like a math expression, evaluate it
    if (this.isMathExpression(value)) {
      return this.eval(value);
    }

    // Otherwise just parse as float
    return parseFloat(value) || 0;
  }
};

// Make it globally available
if (typeof global !== 'undefined') {
  global.MathEvaluator = MathEvaluator;
} else if (typeof window !== 'undefined') {
  window.MathEvaluator = MathEvaluator;
}
```

## Usage in Extensions

### Example 1: Finance Extension with Math Expressions

```javascript
// In loan command or similar
loan.execute = function(payload) {
  const params = this.getParsedParams(payload);

  // These can now accept expressions like "0.05/12" or "5*12"
  const amount = MathEvaluator.parseNumeric(params[0]);
  const termInMonths = MathEvaluator.parseNumeric(params[1]);
  const annualRate = MathEvaluator.parseNumeric(params[2]) / 100;

  // Rest of logic...
};
```

### Example 2: Direct Expression Evaluation

```javascript
// User can type: pmt(0.05/12, 360, 300000)
// Instead of pre-calculating: pmt(0.00416667, 360, 300000)

const rate = MathEvaluator.parseNumeric(params[0]); // "0.05/12" → 0.00416667
```

### Example 3: Custom Math Command

```javascript
const calculate = new Command({
  name: "calculate",
  parameters: [
    new Parameter({type: "string", name: "expression", helpText: "Math expression", default: ""})
  ],
  type: "insert",
  helpText: "Evaluate a math expression",
  extension: extensionRoot
});

calculate.execute = function(payload) {
  const params = this.getParsedParams(payload);
  const expression = params[0];

  try {
    const result = MathEvaluator.eval(expression);
    return new ReturnObject({
      status: "success",
      message: "Calculated",
      payload: result.toString()
    });
  } catch (error) {
    return new ReturnObject({
      status: "error",
      message: error.message
    });
  }
};
```

## Supported Expression Features

Your Swift implementation should support:

- **Basic operators**: `+`, `-`, `*`, `/`
- **Parentheses**: `(2 + 3) * 4`
- **Exponents**: `2^3` or `2**3`
- **Modulo**: `10 % 3`
- **Decimals**: `0.05 / 12`
- **Negative numbers**: `-5 + 3`
- **Common functions** (optional):
  - `sqrt(16)` → 4
  - `abs(-5)` → 5
  - `round(3.7)` → 4
  - `floor(3.7)` → 3
  - `ceil(3.2)` → 4

## Error Handling

The bridge should handle common errors:

- **Division by zero**: `5 / 0`
- **Invalid syntax**: `5 + * 3`
- **Unclosed parentheses**: `(5 + 3`
- **Unknown functions**: `foo(5)`
- **Invalid characters**: `5 & 3`

Return descriptive errors in the `error` field of `MathEvaluationResult`.

## Testing

### Swift Tests

```swift
func testMathEvaluatorBridge() {
    let bridge = MathEvaluatorBridgeImpl(mathEvaluator: mathEvaluator)

    // Basic arithmetic
    XCTAssertEqual(bridge.evaluateExpression("5 + 3").value, 8.0)
    XCTAssertEqual(bridge.evaluateExpression("10 / 2").value, 5.0)

    // Decimals
    XCTAssertEqual(bridge.evaluateExpression("0.05 / 12").value, 0.00416667, accuracy: 0.000001)

    // Parentheses
    XCTAssertEqual(bridge.evaluateExpression("(2 + 3) * 4").value, 20.0)

    // Error cases
    XCTAssertFalse(bridge.evaluateExpression("5 + ").success)
    XCTAssertFalse(bridge.evaluateExpression("abc").success)
}
```

### JavaScript Tests

```javascript
// In your extension tests
function testMathEvaluator() {
  assert(MathEvaluator.eval("5 + 3") === 8);
  assert(MathEvaluator.eval("0.05/12") < 0.00417 && MathEvaluator.eval("0.05/12") > 0.00416);
  assert(MathEvaluator.parseNumeric("12*30") === 360);
  assert(MathEvaluator.parseNumeric(42) === 42);
  assert(MathEvaluator.isMathExpression("5+3") === true);
  assert(MathEvaluator.isMathExpression("42") === false);
}
```

## Migration Path

Once the bridge is implemented, update finance commands:

1. **Update parameter parsing** to use `MathEvaluator.parseNumeric()`
2. **Update help text** to mention expression support:
   - "Interest rate per period (e.g., 0.05 for 5% or 0.05/12 for monthly)"
3. **Update tutorials** with expression examples:
   - `new TutorialCommand({command: "pmt(0.05/12, 360, 300000)", description: "..."})`

## Benefits

- **User convenience**: Users can enter `0.05/12` instead of `0.00416667`
- **Readability**: Expressions like `365/12` are clearer than `30.41667`
- **Flexibility**: Users can calculate on-the-fly without external tools
- **Consistency**: Same math engine across all extensions

## Security Considerations

- Expression evaluation happens in Swift, not JavaScript `eval()`
- Input is validated before evaluation
- Only math operations allowed, no code execution
- Errors are caught and returned safely
