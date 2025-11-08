# Dice Extension

Roll dice of various types directly in your Antinote notes.

## Commands

### `roll`

Roll dice with customizable die types and quantities.

**Aliases:** `dice`, `d`

**Parameters:**
- `dieType` (string, optional): Type of die to roll (e.g., D6, D20). Default: D6
- `numberOfDice` (int, optional): Number of dice to roll. Default: 1

**Examples:**

```
** roll
```
Rolls one D6 (six-sided die). Output: `3`

```
** roll(D20)
```
Rolls one D20 (twenty-sided die). Output: `17`

```
** roll(D6, 3)
```
Rolls three D6 dice. Output: `4, 2, 6`

```
** roll(D12, 2)
```
Rolls two D12 dice. Output: `8, 11`

```
** roll(D100, 1)
```
Rolls one D100 (percentile die). Output: `73`

## Supported Die Types

Any die type from D2 to D1000 is supported, including:
- D2 (coin flip)
- D3
- D4
- D6 (standard die)
- D8
- D10
- D12
- D20 (common in RPGs)
- D100 (percentile)
- And any custom number up to D1000

## Limitations

- Minimum die type: D2
- Maximum die type: D1000
- Maximum number of dice per roll: 100

## Version

1.0.0
