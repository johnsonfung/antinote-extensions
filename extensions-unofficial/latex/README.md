# LaTeX Extension for Antinote

A utility extension to easily work with LaTeX syntax in your Antinote notes.

## Commands

### `::latex(expression)`
Formats a single math expression into block LaTeX math delimiters `$$expression$$`.

#### Example
**Before:**
```text
::latex(3x + 5 = 12)
```

**After execution:**
```latex
$$3x + 5 = 12$$
```

---

### `::latex_note`
Searches the entire note for LaTeX formatting (`$$` and `$`). If found, it toggles it off (converting them back to `[content]`). If not found, it toggles it on (converting `[content]` to `$content$`, or wrapping the entire note in `$$ ... $$` if no brackets exist).

#### Example (Inline Toggle On)
**Before:**
```text
The Pythagorean theorem states that [a^2 + b^2 = c^2], where [c] is the hypotenuse.
```

**After `::latex_note`:**
```text
The Pythagorean theorem states that $a^2 + b^2 = c^2$, where $c$ is the hypotenuse.
```

#### Example (Block Toggle On)
**Before:**
```text
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
```

**After `::latex_note`:**
```latex
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
```

## Installation

To install this extension locally:
1. In Antinote, open **Settings > Extensions**.
2. Click **Open Extensions Folder** to open the extensions directory in Finder.
3. Copy the `latex` folder into that directory.
4. Go back to Settings and click **Reload Extensions**.
