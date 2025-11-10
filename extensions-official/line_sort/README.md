# Line Sort Extension

Sort and manipulate lines in your notes with powerful sorting options including alphabetical, numerical, and reverse ordering.

## Features

- **Alphabetical Sorting** - Sort lines A-Z or Z-A
- **Numerical Sorting** - Sort by first or last number in each line
- **Reverse Order** - Flip the order of all lines
- **Duplicate Detection** - Find duplicate lines and see which are repeated
- **Duplicate Removal** - Remove duplicate lines keeping first or last occurrence
- **Header Preservation** - Optionally keep the first line in place while sorting the rest
- **Smart Number Handling** - Supports negative numbers, decimals, and mixed content

## Commands

### sort_lines_alpha()

Sort lines alphabetically (case-insensitive).

**Parameters:**
- `reverse` (bool, optional): Sort in reverse order (Z-A). Default: false
- `ignoreFirstLine` (bool, optional): Keep first line in place while sorting the rest. Default: false

**Examples:**

```
sort_lines_alpha()
```
Sort all lines alphabetically (A-Z).

```
sort_lines_alpha(true)
```
Sort all lines in reverse alphabetical order (Z-A).

```
sort_lines_alpha(false, true)
```
Sort lines alphabetically, but keep the first line (e.g., header) in place.

**Use Cases:**
- Alphabetize a list of names, items, or terms
- Sort TODO items alphabetically
- Organize bibliography entries
- Clean up unsorted lists

---

### sort_lines_number()

Sort lines by the first number found in each line.

**Parameters:**
- `reverse` (bool, optional): Sort in reverse order (highest to lowest). Default: false
- `ignoreFirstLine` (bool, optional): Keep first line in place while sorting the rest. Default: false

**Examples:**

```
sort_lines_number()
```
Sort lines by the first number in each line (ascending).

```
sort_lines_number(true)
```
Sort lines by first number in descending order.

```
sort_lines_number(false, true)
```
Sort by first number, keeping the header line in place.

**Use Cases:**
- Sort numbered lists that got out of order
- Organize items by ID or reference number
- Sort log entries by error code
- Arrange data by priority or sequence numbers

**Number Handling:**
- Supports negative numbers: `-5`, `-10.5`
- Supports decimals: `3.14`, `2.5`
- Lines without numbers are moved to the end
- Uses the first number found in each line

---

### sort_lines_number_last()

Sort lines by the last number found in each line.

**Parameters:**
- `reverse` (bool, optional): Sort in reverse order (highest to lowest). Default: false
- `ignoreFirstLine` (bool, optional): Keep first line in place while sorting the rest. Default: false

**Examples:**

```
sort_lines_number_last()
```
Sort lines by the last number in each line (ascending).

```
sort_lines_number_last(true)
```
Sort lines by last number in descending order.

```
sort_lines_number_last(false, true)
```
Sort by last number, keeping the header line in place.

**Use Cases:**
- Sort items by price or cost at the end of line
- Organize entries by final score or rating
- Sort "X of Y" formatted lines by the Y value
- Arrange data by trailing timestamps or counts

**Example Data:**
```
Item 1 costs $50
Item 2 costs $30
Item 3 costs $100
```
After `sort_lines_number_last()`:
```
Item 2 costs $30
Item 1 costs $50
Item 3 costs $100
```

---

### sort_lines_reverse()

Reverse the order of all lines in the document.

**Parameters:**
- `ignoreFirstLine` (bool, optional): Keep first line in place while reversing the rest. Default: false

**Examples:**

```
sort_lines_reverse()
```
Reverse the order of all lines.

```
sort_lines_reverse(true)
```
Reverse lines, but keep the first line (e.g., header) in place.

**Use Cases:**
- Flip chronological order (newest first → oldest first)
- Reverse a countdown or sequence
- Mirror a list for different perspective
- Undo an accidental sort

**Example:**
```
First
Second
Third
Fourth
```
After `sort_lines_reverse()`:
```
Fourth
Third
Second
First
```

---

### dedupe_lines()

Remove duplicate lines from the document, keeping either the first or last occurrence.

**Parameters:**
- `keepFirst` (bool, optional): Keep first occurrence (true) or last (false). Default: true
- `ignoreFirstLine` (bool, optional): Skip first line when deduping. Default: false

**Examples:**

```
dedupe_lines()
```
Remove duplicate lines, keeping the first occurrence of each.

```
dedupe_lines(false)
```
Remove duplicate lines, keeping the last occurrence of each.

```
dedupe_lines(true, true)
```
Remove duplicates while preserving the header line.

**Use Cases:**
- Clean up lists with accidental duplicates
- Remove repeated entries from logs
- Deduplicate imported data
- Clean up copy-pasted content

**Example:**
```
apple
banana
apple
cherry
banana
```
After `dedupe_lines()`:
```
apple
banana
cherry
```

---

### get_dupes()

Find and display duplicate lines grouped by their content. This is an **insert** command that adds a duplicate report at your cursor.

**Parameters:**
- `ignoreFirstLine` (bool, optional): Skip first line when finding duplicates. Default: false

**Examples:**

```
get_dupes()
```
Find all duplicate lines in the document.

```
get_dupes(true)
```
Find duplicates, skipping the first line (header).

**Output Format:**
```
# Duplicates Found

# Duplicate group 1 (3 occurrences)
apple

# Duplicate group 2 (2 occurrences)
banana
```

**Use Cases:**
- Identify which lines are duplicated before cleaning
- Audit data quality in lists
- Find repeated items in TODO lists
- Verify uniqueness of entries

---

## Common Patterns

### Sorting with Headers

All commands support the `ignoreFirstLine` parameter to preserve header rows:

```
sort_lines_alpha(false, true)    // Sort alphabetically, keep header
sort_lines_number(false, true)   // Sort numerically, keep header
sort_lines_reverse(true)         // Reverse order, keep header
```

**Example:**
```
# Shopping List
Milk
Eggs
Bread
```
After `sort_lines_alpha(false, true)`:
```
# Shopping List
Bread
Eggs
Milk
```

### Reverse Sorting

Use the `reverse` parameter for descending order:

```
sort_lines_alpha(true)         // Z to A
sort_lines_number(true)        // Highest to lowest
sort_lines_number_last(true)   // Sort by last number, descending
```

## Use Cases

### Project Management
- Sort TODO items by priority number
- Alphabetize task lists
- Reverse changelog order (newest/oldest first)

### Data Organization
- Sort CSV-like data by any column with numbers
- Alphabetize reference lists
- Organize numbered items that got scrambled

### Note Taking
- Alphabetize meeting attendees
- Sort ideas and brainstorm items
- Organize research citations

### Development
- Sort import/require statements
- Alphabetize configuration entries
- Organize numbered test cases

## Requirements

- **Data Scope:** full (requires entire note content)
- **Network:** No network calls required
- **API Keys:** None required

## Notes

- All sorting is performed on the entire document
- Empty lines are preserved in their sorted position
- Case-insensitive alphabetical sorting
- Numerical sorting handles negative numbers and decimals
- Lines without numbers are moved to the end when sorting numerically
- The `ignoreFirstLine` option is useful for preserving headers or titles

## License

MIT
