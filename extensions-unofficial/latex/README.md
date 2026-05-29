# LaTeX Extension for Antinote

A utility extension to easily work with LaTeX syntax in your Antinote notes.

## Commands

### `::latex(expression)`
Translates a LaTeX math expression into Unicode characters directly on the line.

#### Example
**Before:**
```text
::latex(3x + 5 = 12)
```

**After execution:**
```text
3x + 5 = 12
```

**Before:**
```text
::latex(\forall x \exists \delta)
```

**After execution:**
```text
∀ x ∃ δ
```

---

### `::latex_note`
Searches the entire note for LaTeX expressions wrapped in math delimiters (`$$ ... $$`, `$ ... $`, or `[ ... ]`) and translates them into inline Unicode characters, stripping the delimiters. If no delimiters are found, it translates the entire note. This is a one-way formatting operation.

#### Example (With Delimiters)
**Before:**
```text
The Pythagorean theorem states that [a^2 + b^2 = c^2], where [c] is the hypotenuse.
```

**After execution:**
```text
The Pythagorean theorem states that a² + b² = c², where c is the hypotenuse.
```

**Before:**
```text
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

**After execution:**
```text
x = ( -b ± √(b² - 4ac) )/(2a)
```

#### Example (No Delimiters)
If no delimiters are present, the command translates any LaTeX elements across the entire note directly.

## Installation

To install this extension locally:
1. In Antinote, open **Settings > Extensions**.
2. Click **Open Extensions Folder** to open the extensions directory in Finder.
3. Copy the `latex` folder into that directory.
4. Go back to Settings and click **Reload Extensions**.
