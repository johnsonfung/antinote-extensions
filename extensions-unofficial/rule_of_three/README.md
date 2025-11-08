# Rule of Three Extension

Calculate proportions using the rule of three mathematical formula, with support for units.

## What is the Rule of Three?

The rule of three is a mathematical method for solving proportions. If you know three values in a proportion, you can calculate the fourth. For example:

- If 5 apples cost $10, how much do 3 apples cost?
- If 5L produces 10m³, how much does 2m³ require?

The formula is: `a/b = c/d`, where you solve for the unknown variable.

## Commands

### `three`

Compute rule of three proportions. One of the last two parameters must be set to 'x' to indicate the unknown value.

**Parameters:**
- `ref1` (string): First reference value (with optional units)
- `ref2` (string): Second reference value (with optional units)
- `req1` (string): First required value (can be 'x' for unknown, with optional units)
- `req2` (string): Second required value (can be 'x' for unknown, with optional units)
- `logic` (bool, optional): Show the calculation diagram. Default: false

**Examples:**

```
** three(5, 10, 1, x)
```
Calculate: If 5 relates to 10, then 1 relates to ?
Result: `2`

```
** three(5, 10, x, 2)
```
Calculate: If 5 relates to 10, then ? relates to 2
Result: `1`

```
** three(5, 10, x, 2, true)
```
Calculate with visual diagram:
```
5 - 10
x: 1 - 2
```

```
** three(5L, 10m^3, x, 2m^3)
```
Calculate with units:
Result: `1L`

```
** three(5L, 10m^3, x, 2m^3, true)
```
Calculate with units and show the logic:
```
5L - 10m^3
x: 1L - 2m^3
```

---

## How to Use

1. Identify your known values: two reference values and one required value
2. Use 'x' for the unknown value you want to calculate
3. Set the last parameter to `true` if you want to see the calculation diagram
4. Units are preserved and displayed in the output

## Validation

- Either `req1` or `req2` must be 'x', but not both
- The first two parameters (`ref1` and `ref2`) cannot be 'x'
- Values can include units (e.g., `5L`, `10m^3`, `2kg`)

## Version

1.0.0

## Author

johnsonfung
