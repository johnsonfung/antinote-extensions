# Date Extension

Insert dates with various formats and offsets, including business day calculations.

## Commands

### `today`

Insert today's date, optionally offset by days.

**Parameters:**
- `daysOffset` (int, optional): Days to add/subtract from today. Default: 0

**Examples:**

```
** today
```
Insert today's date.

```
** today(7)
```
Insert date 7 days from today.

```
** today(-5)
```
Insert date 5 days ago.

---

### `tomorrow`

Insert tomorrow's date, optionally offset by additional days.

**Parameters:**
- `daysOffset` (int, optional): Additional days to add/subtract. Default: 0

**Examples:**

```
** tomorrow
```
Insert tomorrow's date.

```
** tomorrow(7)
```
Insert date 8 days from today (tomorrow + 7).

```
** tomorrow(-1)
```
Insert today's date (tomorrow - 1).

---

### `yesterday`

Insert yesterday's date, optionally offset by additional days.

**Parameters:**
- `daysOffset` (int, optional): Additional days to add/subtract. Default: 0

**Examples:**

```
** yesterday
```
Insert yesterday's date.

```
** yesterday(-7)
```
Insert date 8 days ago (yesterday - 7).

```
** yesterday(1)
```
Insert today's date (yesterday + 1).

---

### `business_day`

Insert a date offset by business days (excludes weekends).

**Parameters:**
- `businessDaysOffset` (int, optional): Business days to add/subtract. Default: 0

**Examples:**

```
** business_day
```
Insert today if weekday, or next Monday if weekend.

```
** business_day(1)
```
Insert next business day (tomorrow if weekday).

```
** business_day(5)
```
Insert date 5 business days from now.

```
** business_day(-3)
```
Insert date 3 business days ago.

---

## Preferences

This extension supports the following preferences (configured in Antinote settings):

- **Date Format**: Choose from:
  - `local_long_date` (default): e.g., "January 15, 2025"
  - `local_short_date`: e.g., "1/15/25"
  - `us_mdy`: e.g., "January 15, 2025" (US format)
  - `yyyy-mm-dd`: e.g., "2025-01-15"
  - Custom patterns: e.g., "YYYY/MM/DD"

- **Locale**: Optional locale code (e.g., 'en-CA', 'fr-FR'). Leave empty for system default.

## Version

1.0.0

## Author

johnsonfung
