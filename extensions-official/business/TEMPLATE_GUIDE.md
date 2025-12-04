# Antinote Math Template Guide

This guide explains how to create effective math templates for Antinote extensions.

## Activating Math Mode

Place `math` at the top of the note to activate math functions.

## Variable Definitions

Use a colon (`:`) to define variables:

```
variable_name : 50
another_var : 100
```

## Calculations

Whenever a line has an equals sign (`=`), Antinote will calculate the expression before it and insert the result after the `=`.

### Basic calculation:
```
total : first_value + second_value =
```
Result: Antinote inserts the calculated value after `=`

### Pre-filled results (for templates):
```
total : first_value + second_value = 150
```
The `= 150` shows users what to expect. When they change input values, this result updates automatically.

## Template Design Principles

### 1. Input Section at Top
Group all user-editable values at the beginning:
```
## Your Numbers
starting_customers : 1000
ending_customers : 850
time_period_months : 12
```

### 2. Calculations Section Below
Reference the input variables in formulas:
```
## Calculated Results
customers_lost : starting_customers - ending_customers = 150
churn_rate : customers_lost / starting_customers = 0.15
```

### 3. Use Descriptive Variable Names
- Use underscores for spaces: `monthly_revenue` not `monthlyRevenue`
- Be explicit: `starting_customers` not `start` or `sc`

### 4. Show Pre-calculated Example Results
Include example results so users understand the expected output:
```
monthly_churn_rate : customers_lost / starting_customers / time_period_months = 0.0125
```

### 5. Formatting Numbers in Results
For display purposes, you can format results with commas:
```
total_revenue : units * price = 1,250,000.00
```

### 6. Avoid Colons and Equals in Non-Calculation Lines
The app will try to calculate any line with `:` or `=`. Avoid these characters in explanatory text.

**Wrong:**
```
**Industry Benchmarks**:
- SaaS B2B: 5-7% monthly churn = healthy
```

**Correct:**
```
**Industry Benchmarks**
- SaaS B2B - 5-7% monthly churn is healthy
```

### 7. Don't Apply Markdown to Variable Names
Variable names should be plain text, not formatted with markdown.

**Wrong:**
```
**monthly_churn_rate** : churned / total = 0.05
```

**Correct:**
```
monthly_churn_rate : churned / total = 0.05
```

### 8. Use Standalone Calculations for Display
In explanation sections, use calculations without variable assignment when you just want to display a computed value:

```
**Your Churn Rate (Monthly)**
monthly_churn_rate * 100 = 5.00

**Your Churn Rate (Annual)**
annual_churn_rate * 100 = 46.00
```

## Example Template Structure

```
math

# Calculator Title

## Input Values (Edit These)
input_one : 100
input_two : 50
input_three : 25

## Calculations
subtotal : input_one + input_two = 150
total : subtotal + input_three = 175
percentage : input_three / total = 0.14

---

## What This Means

**Your Subtotal**
subtotal = 150

**Your Total**
total = 175

**Your Percentage**
percentage * 100 = 14.00

**Benchmarks**
- Good performance is above 50%
- Excellent performance is above 75%

**Next Steps**
- Review your inputs regularly
- Compare against industry standards
```

## Key Points

1. `math` keyword activates the calculator
2. `:` defines a variable or expression
3. `=` triggers auto-calculation
4. Users edit input values at top, results update automatically below
5. Pre-fill example results so the template makes sense on first insert
6. Avoid `:` and `=` in non-calculation text (use `-` and `is` instead)
7. Don't apply markdown formatting to variable names
8. Use standalone calculations (without variable assignment) for display in explanation sections
