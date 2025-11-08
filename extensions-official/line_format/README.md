# Line Format Extension

Format the current line with various text transformations including case conversions and formatting styles.

## Commands

### `uppercase_line`

Convert the current line to UPPERCASE.

**Examples:**

```
** uppercase_line
```
Converts "hello world" to "HELLO WORLD"

---

### `lowercase_line`

Convert the current line to lowercase.

**Examples:**

```
** lowercase_line
```
Converts "HELLO WORLD" to "hello world"

---

### `sentence_case_line`

Convert the current line to Sentence case (first letter capitalized).

**Examples:**

```
** sentence_case_line
```
Converts "hello world" to "Hello world"

---

### `title_case_line`

Convert the current line to Title Case (capitalize first letter of each word).

**Examples:**

```
** title_case_line
```
Converts "hello world" to "Hello World"

---

### `camel_case`

Convert the current line to camelCase.

**Examples:**

```
** camel_case
```
Converts "hello world" to "helloWorld"

---

### `snake_case`

Convert the current line to snake_case.

**Examples:**

```
** snake_case
```
Converts "hello world" to "hello_world"

---

### `kebab_case`

Convert the current line to kebab-case.

**Examples:**

```
** kebab_case
```
Converts "hello world" to "hello-world"

---

### `remove_quotes_line`

Remove surrounding quotes from the current line.

**Examples:**

```
** remove_quotes_line
```
Converts `"hello world"` to `hello world`

Also handles single quotes: `'hello world'` to `hello world`

---

## Version

1.0.0

## Author

johnsonfung
