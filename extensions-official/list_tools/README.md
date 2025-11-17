# List Tools Extension

Convert between comma-separated lists, lines, and custom delimiters.

## Commands

### commas_to_list(trimWhitespace?, quoteChar?)
Convert comma-separated items to lines.

**Parameters:**
- `trimWhitespace` (boolean, optional): Trim whitespace from each item (default: true)
- `quoteChar` (string, optional): Quote character to respect (empty for all quotes) (default: "")

**Examples:**
```
commas_to_list()                   // Convert comma-separated to lines
commas_to_list(false)              // Convert without trimming whitespace
commas_to_list(true, '"')          // Respect only double quotes
```

**Input:**
```
apple, banana, cherry
```

**Output:**
```
apple
banana
cherry
```

### commas_to(delimiter, trimWhitespace?, quoteChar?)
Convert comma-separated items to custom delimiter.

**Parameters:**
- `delimiter` (string): Delimiter to use for output
- `trimWhitespace` (boolean, optional): Trim whitespace from each item (default: true)
- `quoteChar` (string, optional): Quote character to respect (empty for all quotes) (default: "")

**Examples:**
```
commas_to('|')                     // Convert commas to pipes
commas_to(';', false)              // Convert commas to semicolons without trimming
```

**Input:**
```
apple, banana, cherry
```

**Output:**
```
apple|banana|cherry
```

### lines_to_commas()
Convert lines to comma-separated list.

**Examples:**
```
lines_to_commas()                  // Convert lines to comma-separated
```

**Input:**
```
apple
banana
cherry
```

**Output:**
```
apple, banana, cherry
```

### lines_to(delimiter)
Convert lines to custom delimiter-separated list.

**Parameters:**
- `delimiter` (string): Delimiter to use for joining lines

**Examples:**
```
lines_to('|')                      // Convert lines to pipe-separated
lines_to(' | ')                    // Convert lines to pipe with spaces
```

**Input:**
```
apple
banana
cherry
```

**Output:**
```
apple|banana|cherry
```

## Quote Handling

By default, all commands respect quotes (single, double, and backticks) when parsing comma-separated values. This means commas inside quoted strings are ignored.

**Example:**
```
Input: "Smith, John", 25, "New York"
Output (commas_to_list):
"Smith, John"
25
"New York"
```

## Category
Text Manipulation

## Author
johnsonfung

## Version
1.0.0
