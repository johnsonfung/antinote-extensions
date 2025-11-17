# Regex Extension

Powerful regex-based text manipulation with pattern matching.

## Commands

### regex_remove(expression)
Remove all text matching the regex pattern.

**Parameters:**
- `expression` (string): Regex pattern (plain or /pattern/flags format)

**Default Flags:** `gi` (global, case-insensitive)

**Examples:**
```
regex_remove('\\d+')               // Remove all numbers
regex_remove('/TODO/g')            // Remove all "TODO" (case-sensitive)
regex_remove('^\\s+')              // Remove leading whitespace from all lines
regex_remove('[aeiou]')            // Remove all vowels
```

**Input:**
```
Hello 123 World 456
```

**Output (using `regex_remove('\\d+')`:**
```
Hello  World
```

### regex_keep(expression)
Keep only text matching the regex pattern.

**Parameters:**
- `expression` (string): Regex pattern (plain or /pattern/flags format)

**Default Flags:** `gi` (global, case-insensitive)

**Examples:**
```
regex_keep('\\d+')                 // Keep only numbers
regex_keep('/[A-Z]+/g')            // Keep only uppercase letters
regex_keep('\\w+@\\w+\\.\\w+')     // Keep only email-like patterns
```

**Input:**
```
Hello 123 World 456
```

**Output (using `regex_keep('\\d+')`:**
```
123456
```

### regex_insert(expression, delimiter?)
Extract and insert regex matches with a delimiter.

**Parameters:**
- `expression` (string): Regex pattern (plain or /pattern/flags format)
- `delimiter` (string, optional): Delimiter to use between matches (default: newline)

**Default Flags:** `gi` (global, case-insensitive)

**Examples:**
```
regex_insert('\\d+')               // Extract all numbers to lines
regex_insert('\\w+@\\w+\\.\\w+', ', ') // Extract emails as comma-separated
regex_insert('/https?:\\/\\/[^\\s]+/gi') // Extract all URLs to lines
```

**Input:**
```
Hello 123 World 456
```

**Output (using `regex_insert('\\d+')`:**
```
123
456
```

## Regex Pattern Format

You can specify regex patterns in two ways:

1. **Plain string** (uses default `gi` flags):
   ```
   regex_remove('\\d+')
   ```

2. **/pattern/flags format** (custom flags):
   ```
   regex_remove('/\\d+/g')         // Case-sensitive
   regex_remove('/test/gm')        // Multiline mode
   ```

## Common Regex Flags

- `g` - Global (find all matches, not just first)
- `i` - Case insensitive
- `m` - Multiline (^ and $ match line boundaries)
- `s` - Dotall (. matches newlines)
- `u` - Unicode
- `y` - Sticky

## Error Handling

When `regex_keep` or `regex_insert` find no matches, they return an error status and keep the original text unchanged, with a message indicating no matches were found.

## Category
Text Manipulation

## Author
johnsonfung

## Version
1.0.0
