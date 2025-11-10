# JSON Tools Extension

Transform, filter, and manipulate JSON and CSV data with powerful tools. Convert between formats, sort arrays, filter objects, modify keys, and find duplicates - all with flexible JSON/JavaScript parsing.

## Features

- **CSV Conversion** - Convert CSV to JSON with configurable key casing
- **Sorting** - Sort arrays of objects by any key or sort primitive arrays
- **Filtering** - Filter arrays with powerful operators (=, !=, >, <, contains, etc.)
- **Key Manipulation** - Add, remove, set, append, or prepend values to keys
- **Duplicate Detection** - Find and remove duplicate objects
- **Flexible Parsing** - Supports loose JSON/JS syntax (single quotes, trailing commas, unquoted keys, comments)

## Configuration

### Preferences

- **Preferred Key Casing** - Default casing style for JSON keys when converting from CSV
  - Options: `snake_case` (default), `camelCase`, `PascalCase`, `kebab-case`, `UPPER_CASE`, `lowercase`

## Commands

### csv_to_json()

Convert CSV to JSON array of objects using the first row as key names.

**Parameters:** None

**Examples:**

```
csv_to_json()
```

Convert CSV like:
```
First Name,Last Name,Age
John,Doe,30
Jane,Smith,25
```

To JSON (with snake_case config):
```json
[
  {
    "first_name": "John",
    "last_name": "Doe",
    "age": 30
  },
  {
    "first_name": "Jane",
    "last_name": "Smith",
    "age": 25
  }
]
```

**Features:**
- Handles quoted fields with commas: `"123 Main St, NYC"`
- Handles escaped quotes: `"Say ""Hi"""`
- Auto-detects numbers vs strings
- Converts header names to configured casing style
- Validates CSV structure

---

### json_sort(key, reverse, parentKey)

Sort an array of objects by a key value.

**Parameters:**
- `key` (string, required): Key name to sort by
- `reverse` (bool, optional): Sort in descending order. Default: false
- `parentKey` (string, optional): Parent key containing the array

**Examples:**

```
json_sort('name')
```
Sort by name (A-Z).

```
json_sort('age', true)
```
Sort by age (highest to lowest).

```
json_sort('created_at', false, 'users')
```
Sort the `users` array by created_at timestamp.

**Use Cases:**
- Sort user lists by name, age, or join date
- Order products by price
- Arrange tasks by priority or due date

---

### json_filter(key, operator, value, parentKey)

Filter an array of objects, keeping only items that match the criteria.

**Parameters:**
- `key` (string, required): Key to filter by
- `operator` (string, optional): Comparison operator. Default: `=`
  - `=` or `==` - Equals
  - `!=` - Not equals
  - `>` - Greater than
  - `<` - Less than
  - `>=` - Greater than or equal
  - `<=` - Less than or equal
  - `contains` - String contains substring
  - `startsWith` - String starts with
  - `endsWith` - String ends with
- `value` (string, required): Value to compare against
- `parentKey` (string, optional): Parent key containing the array

**Examples:**

```
json_filter('status', '=', 'active')
```
Keep only active items.

```
json_filter('age', '>', '18')
```
Keep only items where age > 18.

```
json_filter('email', 'endsWith', '@company.com')
```
Keep only company emails.

```
json_filter('name', 'contains', 'John')
```
Keep items where name contains "John".

---

### json_filter_out(key, operator, value, parentKey)

Filter an array of objects, removing items that match the criteria.

**Parameters:**
Same as `json_filter`

**Examples:**

```
json_filter_out('status', '=', 'deleted')
```
Remove all deleted items.

```
json_filter_out('age', '<', '18')
```
Remove items where age < 18.

---

### json_add_key(key, value, parentKey)

Add a new key-value pair to all objects in an array.

**Parameters:**
- `key` (string, required): Key name to add
- `value` (string, optional): Value for the key. Blank = null
- `parentKey` (string, optional): Parent key containing the array

**Examples:**

```
json_add_key('status', 'active')
```
Add `"status": "active"` to all objects.

```
json_add_key('created_at', '')
```
Add `"created_at": null` to all objects.

```
json_add_key('count', '0')
```
Add `"count": 0` to all objects (auto-parsed as number).

**Value Parsing:**
- Empty string → `null`
- `"true"` / `"false"` → boolean
- Numeric strings → numbers
- Everything else → strings

---

### json_remove_key(key, parentKey)

Remove a key from all objects in an array.

**Parameters:**
- `key` (string, required): Key name to remove
- `parentKey` (string, optional): Parent key containing the array

**Examples:**

```
json_remove_key('temp_id')
```
Remove the temp_id field from all objects.

---

### json_set_key(key, value, parentKey)

Set a key to a specific value in all objects (overwrites existing values).

**Parameters:**
- `key` (string, required): Key name to set
- `value` (string, required): New value
- `parentKey` (string, optional): Parent key containing the array

**Examples:**

```
json_set_key('verified', 'true')
```
Set verified=true for all objects.

```
json_set_key('count', '0')
```
Reset count to 0 for all objects.

---

### json_append_key(key, value, parentKey)

Append a value to the end of existing key values.

**Parameters:**
- `key` (string, required): Key to append to
- `value` (string, required): Value to append
- `parentKey` (string, optional): Parent key containing the array

**Examples:**

```
json_append_key('name', ' Jr.')
```
Append " Jr." to all names: "John" → "John Jr."

```
json_append_key('url', '.com')
```
Append .com to all URLs: "example" → "example.com"

---

### json_prepend_key(key, value, parentKey)

Prepend a value to the beginning of existing key values.

**Parameters:**
- `key` (string, required): Key to prepend to
- `value` (string, required): Value to prepend
- `parentKey` (string, optional): Parent key containing the array

**Examples:**

```
json_prepend_key('name', 'Dr. ')
```
Prepend "Dr. " to all names: "Smith" → "Dr. Smith"

```
json_prepend_key('url', 'https://')
```
Prepend https:// to all URLs: "example.com" → "https://example.com"

---

### json_dupes(key, parentKey)

Find and display duplicate objects grouped by a key value. This is an **insert** command that adds duplicate report to your note.

**Parameters:**
- `key` (string, required): Key to check for duplicates
- `parentKey` (string, optional): Parent key containing the array

**Examples:**

```
json_dupes('email')
```
Find all objects with duplicate email addresses.

**Output Format:**
```
# Duplicates Found

# Duplicate group 1 (email="test@example.com")
{
  "id": 1,
  "email": "test@example.com",
  "name": "John"
}
{
  "id": 5,
  "email": "test@example.com",
  "name": "Jane"
}

# Duplicate group 2 (email="other@example.com")
...
```

---

### json_dedupe(keepFirst, parentKey)

Remove exact duplicate objects from an array (deep comparison).

**Parameters:**
- `keepFirst` (bool, optional): Keep first occurrence (true) or last (false). Default: true
- `parentKey` (string, optional): Parent key containing the array

**Examples:**

```
json_dedupe()
```
Remove duplicates, keeping first occurrence.

```
json_dedupe(false)
```
Remove duplicates, keeping last occurrence.

**Note:** This performs a deep equality check - objects must be exactly identical to be considered duplicates.

---

### json_sort_array(reverse, parentKey)

Sort an array of primitive values (strings or numbers, not objects).

**Parameters:**
- `reverse` (bool, optional): Sort in descending order. Default: false
- `parentKey` (string, optional): Parent key containing the array

**Examples:**

```
json_sort_array()
```
Sort array `[3, 1, 4, 1, 5]` → `[1, 1, 3, 4, 5]`

```
json_sort_array(true)
```
Sort in reverse: `[1, 2, 3]` → `[3, 2, 1]`

```
json_sort_array(false, 'tags')
```
Sort the `tags` array in object `{"tags": ["zebra", "apple"]}`

---

## Flexible JSON Parsing

This extension supports both strict JSON and loose JavaScript object notation:

**Supported Formats:**
- Standard JSON: `{"name": "value"}`
- Single quotes: `{'name': 'value'}`
- Unquoted keys: `{name: "value"}`
- Trailing commas: `{"a": 1, "b": 2,}`
- Comments: `// comment` and `/* comment */`

**Array Finding:**
- If root is an array of objects, it's used automatically
- Otherwise, the first array of objects found is used
- Use `parentKey` parameter to target a specific nested array

**Examples of Valid Input:**

Standard JSON:
```json
[
  {"id": 1, "name": "John"},
  {"id": 2, "name": "Jane"}
]
```

JavaScript object notation:
```javascript
[
  {id: 1, name: 'John'}, // This is John
  {id: 2, name: 'Jane'},
]
```

Nested array with parentKey:
```json
{
  "users": [
    {"id": 1, "name": "John"},
    {"id": 2, "name": "Jane"}
  ]
}
```
Use `json_sort('name', false, 'users')` to sort the users array.

---

## Use Cases

### Data Cleaning
- Convert CSV exports to JSON for further processing
- Remove deleted or archived items from datasets
- Standardize field values across all objects
- Find and fix duplicate entries

### API Data Processing
- Sort API responses by relevant fields
- Filter large datasets to relevant items
- Add metadata fields (timestamps, flags, etc.)
- Remove sensitive or unnecessary fields

### Spreadsheet Workflows
- Convert CSV exports to JSON
- Sort and filter data before importing elsewhere
- Add calculated fields or defaults
- Identify data quality issues (duplicates)

### Development & Testing
- Generate test data from CSV
- Sort mock data for consistent testing
- Filter datasets to specific test cases
- Clean up imported data

---

## Operators Reference

| Operator | Description | Example |
|----------|-------------|---------|
| `=` or `==` | Equals | `json_filter('status', '=', 'active')` |
| `!=` | Not equals | `json_filter('status', '!=', 'deleted')` |
| `>` | Greater than | `json_filter('age', '>', '18')` |
| `<` | Less than | `json_filter('price', '<', '100')` |
| `>=` | Greater than or equal | `json_filter('score', '>=', '90')` |
| `<=` | Less than or equal | `json_filter('stock', '<=', '10')` |
| `contains` | String contains | `json_filter('name', 'contains', 'Smith')` |
| `startsWith` | String starts with | `json_filter('email', 'startsWith', 'admin')` |
| `endsWith` | String ends with | `json_filter('domain', 'endsWith', '.com')` |

---

## Error Handling

The extension provides helpful error messages for common issues:

- **"Invalid CSV"** - CSV structure is malformed or has missing data
- **"Invalid JSON"** - Could not parse JSON/JS syntax
- **"Could not find an array of objects"** - Document doesn't contain the expected data structure
- **"Key not found in array objects"** - Specified key doesn't exist in the objects
- **"Array contains objects"** - Used `json_sort_array` on objects (use `json_sort` instead)

---

## Requirements

- **Data Scope:** full (requires entire note content)
- **Network:** No network calls required
- **API Keys:** None required

## Notes

- All commands that modify data return the full document with changes applied
- JSON output is formatted with 2-space indentation for readability
- Numeric values in CSV are automatically detected and parsed
- Empty CSV rows are skipped during conversion
- The extension tries to preserve your original formatting where possible when modifying nested arrays

## License

MIT
