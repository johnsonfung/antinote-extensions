// Business Math Templates

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["business"];
  const extensionRoot = ctx.root;

  // --- Command: cac (Customer Acquisition Cost) ---
  const cac = new Command({
  name: "cac",
  parameters: [],
  type: "insert",
  helpText: "Insert a Customer Acquisition Cost (CAC) calculator template.",
  tutorials: [
    new TutorialCommand({command: "cac", description: "Insert CAC calculator template"})
  ],
  extension: extensionRoot
});

cac.execute = function(payload) {
  const template = `math

# Customer Acquisition Cost (CAC) Calculator

## Marketing & Sales Costs (Monthly)
marketing_spend : 10000
sales_salaries : 15000
sales_tools : 2000
advertising : 5000
other_costs : 1000

total_costs : marketing_spend + sales_salaries + sales_tools + advertising + other_costs

## New Customers Acquired
new_customers : 50

## CAC Calculation
cac = total_costs / new_customers

## Key Metrics
months_to_recover : 12
customer_ltv : 1200

ltv_to_cac_ratio = customer_ltv / cac

---

## What This Means

**CAC (Customer Acquisition Cost)**: The total cost to acquire one new customer. This includes all marketing and sales expenses.

**Target CAC**: Should be less than 1/3 of your Customer Lifetime Value (LTV).

**LTV:CAC Ratio**:
- **< 1**: You're losing money on each customer
- **1-3**: Concerning - may not be sustainable
- **3-5**: Good - healthy business
- **> 5**: Excellent - very efficient acquisition

**Payback Period**: Time to recover your CAC through customer revenue. Ideal is < 12 months.`;

  return new ReturnObject({
    status: "success",
    message: "CAC calculator template inserted",
    payload: template
  });
};

// --- Command: ab_test (A/B Test Statistical Significance) ---
const ab_test = new Command({
  name: "ab_test",
  parameters: [],
  type: "insert",
  helpText: "Insert an A/B test statistical significance calculator template.",
  tutorials: [
    new TutorialCommand({command: "ab_test", description: "Insert A/B test calculator"})
  ],
  extension: extensionRoot
});

ab_test.execute = function(payload) {
  const template = `math

# A/B Test Statistical Significance Calculator

## Variant A (Control)
a_visitors : 10000
a_conversions : 250

a_conversion_rate = a_conversions / a_visitors

## Variant B (Treatment)
b_visitors : 10000
b_conversions : 300

b_conversion_rate = b_conversions / b_visitors

## Results
absolute_lift = b_conversions - a_conversions
relative_lift = (b_conversion_rate - a_conversion_rate) / a_conversion_rate

## Statistical Significance
confidence_level : 0.95

---

## Understanding Statistical Significance

**Conversion Rates**:
- Variant A: a_conversion_rate (multiply by 100 for %)
- Variant B: b_conversion_rate (multiply by 100 for %)

**Lift**: relative_lift (multiply by 100 for %)

**What You Need**:
For 95% confidence with current conversion rates, you typically need:
- At least 1,000+ conversions per variant for reliable results
- Larger samples for smaller effect sizes
- Consider using the sample_size command to calculate exact requirements

**Interpreting Results**:
- **< 95% confidence**: Not statistically significant - could be random chance
- **95%+ confidence**: Statistically significant - likely a real difference
- **> 99% confidence**: Highly significant - strong evidence of difference

**Important Notes**:
- Don't stop tests too early (peaking problem)
- Run tests for full business cycles (week/month)
- Watch for novelty effects
- Consider practical significance vs statistical significance`;

  return new ReturnObject({
    status: "success",
    message: "A/B test calculator template inserted",
    payload: template
  });
};

// --- Command: sample_size ---
const sample_size = new Command({
  name: "sample_size",
  parameters: [],
  type: "insert",
  helpText: "Insert a sample size calculator template for A/B tests.",
  tutorials: [
    new TutorialCommand({command: "sample_size", description: "Insert sample size calculator"})
  ],
  extension: extensionRoot
});

sample_size.execute = function(payload) {
  const template = `math

# Sample Size Calculator for A/B Tests

## Current Metrics
baseline_conversion_rate : 0.025
minimum_detectable_effect : 0.005

## Test Parameters
confidence_level : 0.95
statistical_power : 0.80

## Calculations
improved_rate = baseline_conversion_rate + minimum_detectable_effect
relative_improvement = minimum_detectable_effect / baseline_conversion_rate

---

## How to Calculate Sample Size

Use this formula for each variant:
**n = 2 × (Zα + Zβ)² × p × (1-p) / (MDE)²**

Where:
- **Zα** = 1.96 (for 95% confidence, two-tailed)
- **Zβ** = 0.84 (for 80% power)
- **p** = average conversion rate ≈ baseline_conversion_rate
- **MDE** = minimum_detectable_effect

## Quick Reference Table

For **95% confidence** and **80% power**:

| Baseline Rate | 10% Relative Change | 20% Relative Change |
|---------------|---------------------|---------------------|
| 1% (0.01)     | ~156,000 per variant| ~39,000 per variant |
| 2.5% (0.025)  | ~62,000 per variant | ~15,500 per variant |
| 5% (0.05)     | ~31,000 per variant | ~7,750 per variant  |
| 10% (0.10)    | ~15,500 per variant | ~3,875 per variant  |

## What This Means

**Your Test**: To understand your specific test requirements, multiply minimum_detectable_effect by 100 for percentage points and divide by baseline_conversion_rate for relative improvement.

**Key Insights**:
- Smaller effect sizes need MUCH larger samples
- Higher baseline conversion rates need smaller samples
- 95% confidence + 80% power is industry standard
- Double the calculated number for total test size (both variants)

**Practical Tips**:
- Run tests for at least 1-2 full business cycles
- Don't peek at results early (increases false positives)
- Consider your traffic: sample_size ÷ daily_visitors = days_needed`;

  return new ReturnObject({
    status: "success",
    message: "Sample size calculator template inserted",
    payload: template
  });
};

// --- Command: retention_churn ---
const retention_churn = new Command({
  name: "retention_churn",
  parameters: [],
  type: "insert",
  helpText: "Insert a retention and churn analysis template.",
  tutorials: [
    new TutorialCommand({command: "retention_churn", description: "Insert retention/churn calculator"})
  ],
  extension: extensionRoot
});

retention_churn.execute = function(payload) {
  const template = `math

# Retention & Churn Analysis

## Monthly Cohort Data
customers_start_of_month : 1000
new_customers : 100
churned_customers : 50

customers_end_of_month = customers_start_of_month + new_customers - churned_customers

## Churn Calculations
monthly_churn_rate = churned_customers / customers_start_of_month
monthly_retention_rate = 1 - monthly_churn_rate

annual_churn_rate = 1 - ((1 - monthly_churn_rate) ** 12)
annual_retention_rate = 1 - annual_churn_rate

## Customer Lifetime
average_customer_lifetime_months = 1 / monthly_churn_rate
average_customer_lifetime_years = average_customer_lifetime_months / 12

## Growth Rate
net_growth = new_customers - churned_customers
net_growth_rate = net_growth / customers_start_of_month

---

## Understanding Retention & Churn

**Churn Rate**: Percentage of customers who leave each period.
- **Monthly Churn**: monthly_churn_rate × 100 = __%
- **Annual Churn**: annual_churn_rate × 100 = __%

**Retention Rate**: Percentage of customers who stay.
- **Monthly Retention**: monthly_retention_rate × 100 = __%
- **Annual Retention**: annual_retention_rate × 100 = __%

**Customer Lifetime**: How long average customer stays.
- Average lifetime: average_customer_lifetime_months months (average_customer_lifetime_years years)

**Benchmark Targets by Industry**:
- **SaaS B2B**: 5-7% monthly churn = healthy, <5% = excellent
- **SaaS B2C**: 5-10% monthly churn = acceptable, <5% = excellent
- **E-commerce**: 15-25% monthly churn = typical
- **Subscription boxes**: 10-15% monthly churn = typical

**What This Means**:
- Lower churn = longer customer lifetime = higher LTV
- Even small churn improvements have HUGE impact on LTV
- Reducing monthly churn from 5% to 4% increases lifetime by 25%!

**Action Items**:
- Monitor churn cohorts (do newer customers churn faster?)
- Identify churn warning signals (decreased usage, support tickets)
- Calculate revenue churn vs customer churn (are high-value customers leaving?)
- Set up win-back campaigns for churned customers`;

  return new ReturnObject({
    status: "success",
    message: "Retention & churn calculator template inserted",
    payload: template
  });
};

// --- Command: ltv (Lifetime Value) ---
const ltv = new Command({
  name: "ltv",
  parameters: [],
  type: "insert",
  helpText: "Insert a Customer Lifetime Value (LTV) calculator template.",
  tutorials: [
    new TutorialCommand({command: "ltv", description: "Insert LTV calculator"})
  ],
  extension: extensionRoot
});

ltv.execute = function(payload) {
  const template = `math

# Customer Lifetime Value (LTV) Calculator

## Revenue Metrics
average_revenue_per_month : 50
gross_margin : 0.70

## Retention Metrics
monthly_churn_rate : 0.05
monthly_retention_rate = 1 - monthly_churn_rate

average_customer_lifetime_months = 1 / monthly_churn_rate

## LTV Calculation (Simple)
ltv_simple = average_revenue_per_month * average_customer_lifetime_months * gross_margin

## LTV Calculation (With Discount Rate)
discount_rate : 0.10
monthly_discount_rate = discount_rate / 12

ltv_discounted = (average_revenue_per_month * gross_margin) / (monthly_churn_rate + monthly_discount_rate)

## CAC Comparison
customer_acquisition_cost : 150

ltv_to_cac_ratio = ltv_simple / customer_acquisition_cost
cac_payback_months = customer_acquisition_cost / (average_revenue_per_month * gross_margin)

---

## Understanding Customer Lifetime Value

**What is LTV?**
LTV is the total gross profit you expect to earn from a customer over their entire relationship with your business.

**Your LTV (Simple)**: $ltv_simple
**Your LTV (Discounted)**: $ltv_discounted

The discounted version accounts for the time value of money (future revenue is worth less than present revenue).

**Customer Lifetime**: average_customer_lifetime_months months = average_customer_lifetime_months/12 years

**Key Ratios**:
- **LTV:CAC Ratio**: ltv_to_cac_ratio
  - < 1: Losing money on customers ❌
  - 1-3: Risky, hard to scale ⚠️
  - 3-5: Healthy business ✅
  - > 5: Excellent unit economics 🚀

- **CAC Payback Period**: cac_payback_months months
  - < 12 months: Excellent
  - 12-18 months: Acceptable for B2B
  - > 18 months: Challenging for growth

**Ways to Increase LTV**:
1. **Increase ARPU**: Upsells, cross-sells, price increases
2. **Improve Retention**: Reduce churn through better product/service
3. **Expand Customer Base**: Land & expand strategy
4. **Improve Margins**: Operational efficiency, pricing optimization

**Important Notes**:
- Use gross margin, not revenue (account for costs)
- Calculate cohort-based LTV for more accuracy
- Consider different customer segments (enterprise vs SMB)
- Monitor LTV trends over time`;

  return new ReturnObject({
    status: "success",
    message: "LTV calculator template inserted",
    payload: template
  });
};

// --- Command: arpu (Average Revenue Per User) ---
const arpu = new Command({
  name: "arpu",
  parameters: [],
  type: "insert",
  helpText: "Insert an Average Revenue Per User (ARPU) calculator template.",
  tutorials: [
    new TutorialCommand({command: "arpu", description: "Insert ARPU calculator"})
  ],
  extension: extensionRoot
});

arpu.execute = function(payload) {
  const template = `math

# Average Revenue Per User (ARPU) Calculator

## Revenue Data
total_revenue : 100000
total_users : 5000

## ARPU Calculation
arpu = total_revenue / total_users

## Time Period Analysis
time_period_days : 30
arpu_per_day = arpu / time_period_days
arpu_per_month = arpu_per_day * 30
arpu_per_year = arpu_per_day * 365

## Growth Tracking
previous_period_arpu : 19
arpu_growth = arpu - previous_period_arpu
arpu_growth_rate = arpu_growth / previous_period_arpu

---

## Understanding ARPU

**What is ARPU?**
Average Revenue Per User measures how much revenue you generate per user/customer over a specific time period.

**Your ARPU**: $arpu (per time_period_days days)

**Annualized**:
- Per Month: $arpu_per_month
- Per Year: $arpu_per_year

**Growth**: arpu_growth_rate × 100 = __% period-over-period

**Why ARPU Matters**:
- Tracks revenue growth independent of user growth
- Helps identify monetization improvements
- Key metric for SaaS, subscriptions, and marketplaces
- Useful for forecasting and pricing decisions

**ARPU vs ARPPU**:
- **ARPU**: Includes ALL users (paying + free)
- **ARPPU**: Only includes paying users
- ARPPU is always ≥ ARPU

**Ways to Increase ARPU**:
1. **Upsell/Cross-sell**: Move users to higher tiers
2. **Add-ons**: Additional features or services
3. **Price Increases**: Regular pricing reviews
4. **Usage-based Pricing**: Charge based on consumption
5. **Reduce Discounts**: Minimize promotional pricing
6. **Premium Features**: High-value additions
7. **Annual Plans**: Encourage longer commitments

**Segmentation**:
Consider calculating ARPU by:
- Customer segment (enterprise, SMB, individual)
- Acquisition channel
- Geography
- Product tier
- Cohort (when they signed up)

**Benchmarks** (Monthly ARPU):
- Consumer apps: $1-10
- Freemium SaaS: $10-50
- SMB SaaS: $50-500
- Enterprise SaaS: $500-10,000+`;

  return new ReturnObject({
    status: "success",
    message: "ARPU calculator template inserted",
    payload: template
  });
};

// --- Command: arppu (Average Revenue Per Paying User) ---
const arppu = new Command({
  name: "arppu",
  parameters: [],
  type: "insert",
  helpText: "Insert an Average Revenue Per Paying User (ARPPU) calculator template.",
  tutorials: [
    new TutorialCommand({command: "arppu", description: "Insert ARPPU calculator"})
  ],
  extension: extensionRoot
});

arppu.execute = function(payload) {
  const template = `math

# Average Revenue Per Paying User (ARPPU) Calculator

## Revenue & User Data
total_revenue : 100000
total_users : 5000
paying_users : 1000

## ARPPU Calculation
arppu = total_revenue / paying_users

## ARPU Comparison
arpu = total_revenue / total_users
conversion_rate = paying_users / total_users

## Relationship
arpu_from_arppu = arppu * conversion_rate

## Time Period Analysis
time_period_days : 30
arppu_per_month = (arppu / time_period_days) * 30
arppu_per_year = (arppu / time_period_days) * 365

---

## Understanding ARPPU

**What is ARPPU?**
Average Revenue Per Paying User measures how much revenue you generate from each PAYING customer (excludes free users).

**Your Metrics**:
- **ARPPU**: $arppu (from paying_users users)
- **ARPU**: $arpu (from total_users users)
- **Conversion Rate**: conversion_rate × 100 = __%

**Annualized ARPPU**:
- Per Month: $arppu_per_month
- Per Year: $arppu_per_year

**The ARPU/ARPPU Relationship**:
ARPU = ARPPU × Conversion Rate

You can increase ARPU by:
1. Increasing ARPPU (get paying users to pay more)
2. Increasing Conversion Rate (convert more free users)

**Why This Matters**:
- **High ARPPU, Low Conversion**: Premium product, conversion opportunity
- **Low ARPPU, High Conversion**: Affordable product, upsell opportunity
- **High ARPPU, High Conversion**: Strong product-market fit
- **Low ARPPU, Low Conversion**: Need product or pricing changes

**ARPPU Growth Strategies**:
1. **Tiered Pricing**: Create higher-value tiers
2. **Feature Gating**: Reserve premium features for paid tiers
3. **Usage Limits**: Encourage upgrades through limits
4. **Add-ons & Extensions**: Additional paid features
5. **Annual Billing**: Larger upfront payments (often with discount)
6. **Volume Pricing**: Price based on usage/seats
7. **Professional Services**: Consulting, implementation, training

**Segmentation Analysis**:
Calculate ARPPU by:
- Pricing tier (Basic, Pro, Enterprise)
- Billing frequency (monthly, annual)
- Customer size (seats, usage volume)
- Industry vertical
- Geographic region

**Freemium Benchmarks**:
- **Conversion Rate**: 2-5% typical, 10%+ excellent
- **ARPPU/ARPU Ratio**: Should be 10-50× depending on conversion rate
- Monitor both metrics—don't optimize one at expense of other`;

  return new ReturnObject({
    status: "success",
    message: "ARPPU calculator template inserted",
    payload: template
  });
};

// --- Command: runway ---
const runway = new Command({
  name: "runway",
  parameters: [],
  type: "insert",
  helpText: "Insert a cash runway calculator template for startups.",
  tutorials: [
    new TutorialCommand({command: "runway", description: "Insert runway calculator"})
  ],
  extension: extensionRoot
});

runway.execute = function(payload) {
  const template = `math

# Cash Runway Calculator

## Current Financial Position
cash_in_bank : 500000
monthly_revenue : 50000
monthly_expenses : 75000

## Monthly Burn Rate
monthly_burn = monthly_expenses - monthly_revenue

## Runway Calculation
months_of_runway = cash_in_bank / monthly_burn
years_of_runway = months_of_runway / 12

## Growth Scenarios

### Scenario 1: Current Trajectory
current_burn = monthly_burn
current_runway_months = cash_in_bank / current_burn

### Scenario 2: Revenue Growth
monthly_revenue_growth_rate : 0.10
months_to_project : 12

### Scenario 3: Cost Reduction
expense_reduction_amount : 10000
reduced_monthly_burn = monthly_burn - expense_reduction_amount
extended_runway = cash_in_bank / reduced_monthly_burn

---

## Understanding Cash Runway

**What is Runway?**
The number of months your company can operate before running out of cash, given current revenue and expenses.

**Your Current Situation**:
- **Cash in Bank**: $cash_in_bank
- **Monthly Revenue**: $monthly_revenue
- **Monthly Expenses**: $monthly_expenses
- **Monthly Burn Rate**: $monthly_burn
- **Runway**: months_of_runway months (years_of_runway years)

**Burn Rate Calculation**:
Burn Rate = Revenue - Expenses
- Positive burn (profitable) = generating cash
- Negative burn = consuming cash

**Critical Thresholds**:
- **< 6 months**: 🚨 CRITICAL - Fundraise immediately or cut costs
- **6-12 months**: ⚠️ WARNING - Start fundraising now (6-9 month process)
- **12-18 months**: ✅ HEALTHY - Good position
- **18+ months**: 🚀 STRONG - Excellent position for negotiations

**Extending Your Runway**:

**Option 1: Increase Revenue**
- Accelerate sales cycle
- Raise prices
- Launch new products
- Expand to new markets
- Extended runway impact: Calculate with growth rate

**Option 2: Reduce Costs**
- Cut non-essential spending
- Renegotiate contracts
- Reduce headcount
- Downsize office space
- With $expense_reduction_amount savings: extended_runway months

**Option 3: Raise Capital**
- Start fundraising at 12-18 months runway
- Process typically takes 6-9 months
- Have backup plans if fundraising fails

**Important Considerations**:
- Account for irregular expenses (annual contracts, equipment)
- Build in buffer for unexpected costs (typically 10-20%)
- Consider seasonal revenue variations
- Factor in upcoming growth investments
- Remember: Gross burn vs Net burn (use Net burn for runway)

**Action Items by Runway Length**:

**< 6 months**:
- Emergency cost cuts
- Bridge financing
- Accelerate collections
- Delay payments where possible

**6-12 months**:
- Active fundraising
- Scenario planning
- Cost optimization
- Revenue acceleration

**12-18 months**:
- Strategic planning
- Prepare fundraising materials
- Optimize unit economics

**18+ months**:
- Focus on growth
- Strategic investments
- Plan next funding round timing`;

  return new ReturnObject({
    status: "success",
    message: "Runway calculator template inserted",
    payload: template
  });
};

// --- Command: saas_pricing ---
const saas_pricing = new Command({
  name: "saas_pricing",
  parameters: [],
  type: "insert",
  helpText: "Insert a SaaS pricing strategy helper template.",
  tutorials: [
    new TutorialCommand({command: "saas_pricing", description: "Insert SaaS pricing helper"})
  ],
  extension: extensionRoot
});

saas_pricing.execute = function(payload) {
  const template = `math

# SaaS Pricing Strategy Helper

## Cost Structure
cost_per_customer_monthly : 10
support_cost_per_customer : 5
infrastructure_per_customer : 3

total_cost_per_customer = cost_per_customer_monthly + support_cost_per_customer + infrastructure_per_customer

## Pricing Tiers

### Basic Tier
basic_price : 29
basic_margin = (basic_price - total_cost_per_customer) / basic_price
basic_profit_per_customer = basic_price - total_cost_per_customer

### Professional Tier
pro_price : 79
pro_margin = (pro_price - total_cost_per_customer) / pro_price
pro_profit_per_customer = pro_price - total_cost_per_customer

### Enterprise Tier
enterprise_price : 199
enterprise_margin = (enterprise_price - total_cost_per_customer) / enterprise_price
enterprise_profit_per_customer = enterprise_price - total_cost_per_customer

## Customer Acquisition
cac : 150
target_ltv_to_cac : 3

basic_required_lifetime_months = (cac * target_ltv_to_cac) / basic_profit_per_customer
pro_required_lifetime_months = (cac * target_ltv_to_cac) / pro_profit_per_customer
enterprise_required_lifetime_months = (cac * target_ltv_to_cac) / enterprise_profit_per_customer

## Price Positioning
price_difference_basic_to_pro = pro_price / basic_price
price_difference_pro_to_enterprise = enterprise_price / pro_price

---

## SaaS Pricing Strategy Guide

**Cost Analysis**:
- **Cost per Customer**: $total_cost_per_customer/month
- Always price above costs (obvious, but crucial!)

**Margin Analysis by Tier**:
- **Basic**: basic_margin × 100 = __% margin ($basic_profit_per_customer/month profit)
- **Professional**: pro_margin × 100 = __% margin ($pro_profit_per_customer/month profit)
- **Enterprise**: enterprise_margin × 100 = __% margin ($enterprise_profit_per_customer/month profit)

**Target Margins**:
- 70-90% gross margin is typical for healthy SaaS
- Higher tiers should have better margins

**Customer Lifetime Requirements**:
To achieve target_ltv_to_cac:1 LTV:CAC ratio with $cac CAC:
- **Basic customers** must stay: basic_required_lifetime_months months
- **Pro customers** must stay: pro_required_lifetime_months months
- **Enterprise customers** must stay: enterprise_required_lifetime_months months

**Pricing Tier Strategy**:

**The "Good-Better-Best" Approach**:
- Basic → Pro jump: price_difference_basic_to_pro× increase
- Pro → Enterprise jump: price_difference_pro_to_enterprise× increase

**Ideal Tier Gaps**: 2-5× between tiers
- Too small: No incentive to stay at lower tier
- Too large: Too big a jump to upgrade

**Pricing Psychology**:

1. **Anchor with Highest Price**: Show Enterprise first
2. **Make Middle Tier Attractive**: Most customers choose middle (65-75%)
3. **Decoy Pricing**: Use Basic as anchor to make Pro look good
4. **Value Metric Pricing**: Price on value delivered (seats, usage, features)

**Feature Gating Strategy**:

**Basic Tier Features**:
- Core functionality
- Limited usage/seats
- Community support
- Foundation for upgrades

**Pro Tier Features** (Most Popular):
- Advanced features
- Higher limits
- Email support
- Integrations
- Analytics

**Enterprise Tier Features**:
- Unlimited usage
- Advanced security
- Dedicated support
- Custom integrations
- SLAs & training

**Common Pricing Models**:

1. **Per-Seat**: Price per user ($10/user/month)
2. **Usage-Based**: Price per action/volume
3. **Tiered Features**: Fixed price with feature differences
4. **Hybrid**: Combine models (base + usage)

**Pricing Optimization Tips**:

1. **Test Regularly**: A/B test pricing every 6-12 months
2. **Annual Discount**: Offer 15-20% off for annual payment
3. **Grandfather Pricing**: Lock in existing customers during increases
4. **Value-Based**: Price on customer value, not your costs
5. **Simplicity**: Keep it simple—too many options = decision paralysis
6. **Free Trial**: 14-30 days is standard (credit card optional)

**When to Raise Prices**:
- After adding significant value
- When LTV:CAC is > 5 (could charge more)
- For new customers only (grandfather existing)
- During strong growth periods
- When competitors raise prices

**Red Flags**:
- Negative margin on any tier
- CAC > LTV on any tier
- All customers choosing lowest tier (price too high)
- All customers choosing highest tier (price too low)
- < 2% conversion from free to paid (pricing or value issue)`;

  return new ReturnObject({
    status: "success",
    message: "SaaS pricing helper template inserted",
    payload: template
  });
};
})();
