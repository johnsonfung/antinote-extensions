# Random Extension

Generate random numbers, letters, quotes, and open random Wikipedia pages directly in your Antinote notes.

## Commands

### `random_number`

Insert a random number between two values.

**Parameters:**
- `from` (float, optional): Bottom range. Default: 0
- `to` (float, optional): Top range. Default: 100
- `int` (bool, optional): Round to nearest whole number. Default: true

**Examples:**

```
** random_number
```
Insert a random integer between 0 and 100.

```
** random_number(10, 20)
```
Insert a random integer between 10 and 20.

```
** random_number(10, 20, false)
```
Insert a random decimal number between 10 and 20.

---

### `random_letters`

Insert a random letter or series of letters.

**Parameters:**
- `numberOfLetters` (int, optional): Number of letters to generate. Default: 1

**Examples:**

```
** random_letters
```
Insert a random letter.

```
** random_letters(5)
```
Insert 5 random letters.

---

### `random_quote`

Insert a random inspirational quote.

**Examples:**

```
** random_quote
```
Insert a random quote.

---

### `random_wiki`

Open a random Wikipedia page in your browser.

**Examples:**

```
** random_wiki
```
Open a random Wikipedia page.

## Version

1.0.0

## Author

johnsonfung
