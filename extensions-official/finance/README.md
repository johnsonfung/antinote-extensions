# Finance Extension

Personal finance calculations for loans, mortgages, investments, FIRE planning, and more.

## Loan & Mortgage Commands

### loan()
Calculate loan payment, total interest, and amortization schedule.

Creates an interactive calculator for any type of loan.

**Examples:**
```
loan()
```

### mortgage()
Calculate mortgage payment, total interest, and amortization schedule.

Specialized calculator for home mortgages with detailed payment breakdown.

**Examples:**
```
mortgage()
```

## Investment Commands

### investment()
Calculate investment growth with contributions, taxes, and inflation.

Models investment growth over time with regular contributions and accounts for taxes and inflation.

**Examples:**
```
investment()
```

### pv()
Calculate present value of a future amount.

Determines what a future sum of money is worth today.

**Examples:**
```
pv()
```

### fv_simple()
Calculate future value of a present amount (simple calculation).

Quick calculation of how much money will grow to in the future.

**Examples:**
```
fv_simple()
```

## FIRE (Financial Independence, Retire Early) Planning

### fire_amount()
Calculate annual income from investments using safe withdrawal rate.

Determines how much you can safely withdraw annually from your investments.

**Examples:**
```
fire_amount()
```

### fire_plan()
Calculate path to financial independence and retirement timeline.

Creates a complete plan showing when you can achieve financial independence.

**Examples:**
```
fire_plan()
```

## Excel-Compatible Functions

### fv()
Calculate future value (Excel FV function).

Compatible with Excel's FV function for investment calculations.

**Examples:**
```
fv()
```

### pmt()
Calculate payment per period (Excel PMT function).

Compatible with Excel's PMT function for loan/mortgage payments.

**Examples:**
```
pmt()
```

### npv()
Calculate net present value from cash flows (Excel NPV function).

Evaluates the profitability of an investment or project.

**Examples:**
```
npv()
```

**Note:** Operates on current line - enter cash flows as comma-separated values.

### irr()
Calculate internal rate of return from cash flows (Excel IRR function).

Calculates the rate of return that makes net present value equal to zero.

**Examples:**
```
irr()
```

**Note:** Operates on current line - enter cash flows as comma-separated values.

## Utility Commands

### tax()
Calculate tax amount and after-tax income.

Quick calculator for tax calculations.

**Examples:**
```
tax()
```

## Category
Finance & Math

## Author
johnsonfung

## Version
1.0.2
