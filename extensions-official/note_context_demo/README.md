# Payload Context Demo Extension

This extension demonstrates how extensions can access **note metadata through the payload**, including active keywords and checkbox triggers, without needing full note access.

## Key Features

- **Privacy-Conscious**: Access metadata with `dataScope: "none"` or `"line"`
- **User-Aware**: Automatically respects custom keyword triggers and checkbox settings
- **Simple API**: Just check `payload.activeKeywords` and `payload.checkedCheckboxTriggers`

## Commands

### `showKeywords()`
Displays which keywords are active on the first line of the current note.

**Example:**
```
math list
showKeywords()
```
**Result:** `Active: [math, list]`

---

### `removeChecked()`
Removes all checked checkbox items from a list note. This command automatically detects the user's configured checked checkbox triggers (e.g., `/x`, `done`, etc.).

**Requirements:** The note must have the `list` keyword active.

**Example:**
```
list
Buy groceries
/x Milk
Eggs
/x Bread
removeChecked()
```

**Result:**
```
list
Buy groceries
Eggs
```

---

### `checkMath()`
Checks if the MATH keyword is active in the note.

**Example:**
```
math
checkMath()
```
**Result:** `Math mode is ACTIVE`

**Note:** This command uses `dataScope: "none"` - it doesn't need any note content!

---

### `countKeywords()`
Counts how many keywords are currently active.

**Example:**
```
math list sum
countKeywords()
```
**Result:** `3 keyword(s) active`

---

## Payload API Reference

### `payload.activeKeywords`
Array of active keyword names from the first line of the note.

**Type:** `string[]`

**Example:** `["math", "list", "sum"]`

**Usage:**
```javascript
if (payload.activeKeywords.indexOf("math") !== -1) {
  // Math mode is active
}
```

---

### `payload.checkedCheckboxTriggers`
Array of all configured triggers for checked checkbox items.

**Type:** `string[]`

**Example:** `["/x", "done", "✓"]`

**Default:** `["/x"]`

**Usage:**
```javascript
var triggers = payload.checkedCheckboxTriggers || ["/x"];
var isChecked = triggers.some(function(t) {
  return line.trim().indexOf(t) === 0;
});
```

---

## Use Cases

### 1. Conditional Behavior Based on Active Keywords

```javascript
new Command({
  name: "smartFormat",
  dataScope: "line",
  execute: function(payload) {
    var hasMath = payload.activeKeywords.indexOf("math") !== -1;
    var hasCode = payload.activeKeywords.indexOf("code") !== -1;

    if (hasMath && hasCode) {
      // Special formatting for math + code
    } else if (hasMath) {
      // Math-specific formatting
    }
  }
});
```

### 2. User-Aware Checklist Manipulation

```javascript
new Command({
  name: "countChecked",
  dataScope: "full",
  execute: function(payload) {
    var triggers = payload.checkedCheckboxTriggers || ["/x"];
    var lines = payload.fullText.split('\n');
    var checkedCount = 0;

    lines.forEach(function(line) {
      triggers.forEach(function(trigger) {
        if (line.trim().indexOf(trigger) === 0) {
          checkedCount++;
        }
      });
    });

    return new ReturnObject({
      status: "success",
      payload: "Checked items: " + checkedCount
    });
  }
});
```

### 3. Privacy-Conscious Extensions

```javascript
var privacyExtension = new Extension({
  dataScope: "none"  // No note content access!
});

new Command({
  name: "checkMode",
  extension: privacyExtension,
  execute: function(payload) {
    // Even with no content access, we can check metadata
    var hasMath = payload.activeKeywords.indexOf("math") !== -1;

    return new ReturnObject({
      status: "success",
      payload: hasMath ? "Math mode" : "Normal mode"
    });
  }
});
```

---

## Advantages Over Callable API

The payload-based approach is cleaner than a callable API:

### ✅ Payload-Based (Current)
```javascript
// Works with any dataScope, even "none"
new Command({
  dataScope: "none",
  execute: function(payload) {
    var hasMath = payload.activeKeywords.indexOf("math") !== -1;
  }
});
```

### ❌ Callable API (Would Not Work)
```javascript
// Would NOT work with dataScope: "none"
new Command({
  dataScope: "none",
  execute: function(payload) {
    // payload.fullText would be empty with dataScope: "none"
    var hasMath = NoteContext.hasKeyword(payload.fullText, "math");
  }
});
```

---

## Installation

This extension is bundled with Antinote and serves as a reference implementation for accessing note context via the payload.

---

## Technical Details

**Payload Structure:**
```javascript
{
  parameters: ["arg1", "arg2"],
  fullText: "...",  // Respects dataScope
  userSettings: {
    decimalSeparator: ".",
    thousandsSeparator: ","
  },
  activeKeywords: ["math", "list"],  // Always included
  checkedCheckboxTriggers: ["/x", "done"]  // Always included
}
```

**Keywords Detection:**
- Only analyzes the first line (per Antinote architecture)
- Returns lowercase keyword IDs (e.g., "math", not "MATH")
- Respects custom triggers configured in preferences

**Checkbox Triggers:**
- By default: `["/x"]`
- Users can configure custom triggers in preferences
- These triggers work on any line when `list` is active
