# Filter Lines Extension

Filter and manipulate lines based on content, delimiters, and patterns.

## Commands

### remove_lines_with(text, caseSensitive?)
Remove all lines containing the specified text.

**Parameters:**
- `text` (string): Text to search for in lines
- `caseSensitive` (boolean, optional): Case sensitive matching (default: false)

**Examples:**
```
remove_lines_with('TODO')          // Remove lines containing "TODO"
remove_lines_with('error', true)   // Remove lines with "error" (case-sensitive)
```

### remove_lines_without(text, caseSensitive?)
Remove all lines that do NOT contain the specified text.

**Parameters:**
- `text` (string): Text that must be in lines to keep
- `caseSensitive` (boolean, optional): Case sensitive matching (default: false)

**Examples:**
```
remove_lines_without('TODO')       // Keep only lines with "TODO"
remove_lines_without('error', true) // Keep only lines with "error" (case-sensitive)
```

### remove_lines_empty()
Remove all empty lines from the document.

**Examples:**
```
remove_lines_empty()               // Remove all empty lines
```

### trim_each_whitespace()
Remove leading and trailing whitespace from every line.

**Examples:**
```
trim_each_whitespace()             // Trim whitespace from all lines
```

### remove_each_after(delimiter, occurrence?)
Remove content after the specified delimiter on each line.

**Parameters:**
- `delimiter` (string): Text to remove content after
- `occurrence` (int, optional): Which occurrence to use (1 = first, 2 = second, etc.) (default: 1)

**Examples:**
```
remove_each_after(',')             // Remove everything after first comma
remove_each_after(',', 2)          // Remove everything after second comma
```

### remove_each_before(delimiter, occurrence?)
Remove content before the specified delimiter on each line.

**Parameters:**
- `delimiter` (string): Text to remove content before
- `occurrence` (int, optional): Which occurrence from the end (1 = last, 2 = second-to-last, etc.) (default: 1)

**Examples:**
```
remove_each_before(',')            // Remove everything before last comma
remove_each_before(',', 2)         // Remove everything before second-to-last comma
```

### keep_between(start, end, includeBoundaries?)
Keep only content between start and end delimiters on each line.

**Parameters:**
- `start` (string): Start boundary text
- `end` (string): End boundary text
- `includeBoundaries` (boolean, optional): Include the boundary delimiters in result (default: false)

**Examples:**
```
keep_between('[', ']')             // Keep content between brackets
keep_between('(', ')', true)       // Keep content including parentheses
```

### remove_between(start, end, includeBoundaries?)
Remove content between start and end delimiters on each line.

**Parameters:**
- `start` (string): Start boundary text
- `end` (string): End boundary text
- `includeBoundaries` (boolean, optional): Remove the boundary delimiters as well (default: false)

**Examples:**
```
remove_between('[', ']')           // Remove content between brackets
remove_between('(', ')', true)     // Remove content including parentheses
```

### dedupe_lines(keepFirst?, ignoreFirstLine?)
Remove duplicate lines keeping first or last occurrence.

**Parameters:**
- `keepFirst` (boolean, optional): Keep first occurrence (true) or last (false) (default: true)
- `ignoreFirstLine` (boolean, optional): Skip first line when deduping (default: false)

**Examples:**
```
dedupe_lines()                     // Remove duplicates, keeping first occurrence
dedupe_lines(false)                // Remove duplicates, keeping last occurrence
dedupe_lines(true, true)           // Remove duplicates, keeping first line as header
```

### get_dupes(ignoreFirstLine?)
Find and display duplicate lines grouped together.

**Parameters:**
- `ignoreFirstLine` (boolean, optional): Skip first line when finding dupes (default: false)

**Examples:**
```
get_dupes()                        // Find all duplicate lines
get_dupes(true)                    // Find duplicates, skipping first line
```

## Category
Text Manipulation

## Author
johnsonfung

## Version
1.0.0
