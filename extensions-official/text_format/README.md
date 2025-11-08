# Text Format Extension

Format entire document text with various transformations including find/replace, append, prepend, and case conversions.

## Commands

### `replace`

Find and replace text throughout the entire document.

**Parameters:**
- `find` (string): Text to search for
- `replaceWith` (string): Text to replace with

**Examples:**

```
** replace(foo, bar)
```
Replace all instances of "foo" with "bar" in the document.

---

### `append`

Add text to the end of the document.

**Parameters:**
- `text` (string): Text to append

**Examples:**

```
** append(The End)
```
Adds "The End" to the end of the document.

---

### `prepend`

Add text to the beginning of the document.

**Parameters:**
- `text` (string): Text to prepend

**Examples:**

```
** prepend(Title: )
```
Adds "Title: " to the beginning of the document.

---

### `uppercase`

Convert entire document to UPPERCASE.

**Examples:**

```
** uppercase
```
Converts all text in the document to uppercase.

---

### `lowercase`

Convert entire document to lowercase.

**Examples:**

```
** lowercase
```
Converts all text in the document to lowercase.

---

### `sentence_case`

Convert entire document to Sentence case.

**Examples:**

```
** sentence_case
```
Capitalizes the first letter of each sentence.

---

### `title_case`

Convert entire document to Title Case.

**Examples:**

```
** title_case
```
Capitalizes the first letter of each word in the document.

---

### `capitalize_first`

Capitalize only the first letter of the document.

**Examples:**

```
** capitalize_first
```
Capitalizes the very first letter of the document.

---

### `remove_quotes`

Remove surrounding quotes from the entire document.

**Examples:**

```
** remove_quotes
```
Removes quotes from the beginning and end of the document.

---

## Version

1.0.0

## Author

johnsonfung
