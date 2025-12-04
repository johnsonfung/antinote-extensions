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

total_costs : marketing_spend + sales_salaries + sales_tools + advertising + other_costs = 33,000.00

## New Customers Acquired
new_customers : 50

## CAC Calculation
cac: total_costs / new_customers = 660.00

## Key Metrics
monthly_revenue_per_customer: 100
average_months_retention: 20
customer_ltv : monthly_revenue_per_customer * average_months_retention = 2,000.00

ltv_to_cac_ratio: customer_ltv / cac = 3.03

---

## What This Means

**CAC (Customer Acquisition Cost)**: The total cost to acquire one new customer. This includes all marketing and sales expenses.

**Target CAC**: Should be less than 1/3 of your Customer Lifetime Value (LTV).

**LTV to CAC Ratio**
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
  parameters: [
    new Parameter({type: "number", name: "a_conversions", helpText: "Conversions for variant A (control)", required: true}),
    new Parameter({type: "number", name: "a_size", helpText: "Sample size for variant A", required: true}),
    new Parameter({type: "number", name: "b_conversions", helpText: "Conversions for variant B (treatment)", required: true}),
    new Parameter({type: "number", name: "b_size", helpText: "Sample size for variant B", required: true}),
    new Parameter({type: "number", name: "confidence", helpText: "Required confidence level (0-1)", default: 0.95, required: false})
  ],
  type: "insert",
  helpText: "Calculate A/B test statistical significance from conversion data.",
  tutorials: [
    new TutorialCommand({command: "ab_test(250, 10000, 300, 10000)", description: "Compare A (250/10000) vs B (300/10000)"}),
    new TutorialCommand({command: "ab_test(250, 10000, 300, 10000, 0.99)", description: "Same test with 99% confidence threshold"})
  ],
  extension: extensionRoot
});

ab_test.execute = function(payload) {
  const Stats = ctx.shared.Statistics;
  const params = this.getParsedParams(payload);
  const userSettings = payload.userSettings || null;

  const aConversions = parseFloat(params[0]);
  const aSize = parseFloat(params[1]);
  const bConversions = parseFloat(params[2]);
  const bSize = parseFloat(params[3]);
  const requiredConfidence = params[4] !== undefined ? parseFloat(params[4]) : 0.95;

  // Validate inputs
  if (isNaN(aConversions) || isNaN(aSize) || isNaN(bConversions) || isNaN(bSize)) {
    return new ReturnObject({
      status: "error",
      message: "All parameters must be numbers. Usage: ab_test(a_conversions, a_size, b_conversions, b_size)"
    });
  }

  if (aSize <= 0 || bSize <= 0) {
    return new ReturnObject({
      status: "error",
      message: "Sample sizes must be greater than 0."
    });
  }

  if (aConversions < 0 || bConversions < 0) {
    return new ReturnObject({
      status: "error",
      message: "Conversions cannot be negative."
    });
  }

  if (aConversions > aSize || bConversions > bSize) {
    return new ReturnObject({
      status: "error",
      message: "Conversions cannot exceed sample size."
    });
  }

  if (requiredConfidence <= 0 || requiredConfidence >= 1) {
    return new ReturnObject({
      status: "error",
      message: "Confidence level must be between 0 and 1 (e.g., 0.95 for 95%)."
    });
  }

  // Calculate conversion rates
  const aRate = aConversions / aSize;
  const bRate = bConversions / bSize;

  // Calculate lift
  const absoluteLift = bRate - aRate;
  const relativeLift = aRate > 0 ? (bRate - aRate) / aRate : 0;

  // Calculate statistical significance
  const zScore = Stats.zScoreProportions(aRate, aSize, bRate, bSize);
  const pValue = Stats.getPValueFromZ(zScore);
  const confidence = 1 - pValue;

  // Determine significance level
  const isSignificant = confidence >= requiredConfidence;
  let significanceText = "";
  let significanceEmoji = "";
  if (confidence >= 0.99) {
    significanceText = "Highly Significant";
    significanceEmoji = "🎯";
  } else if (confidence >= requiredConfidence) {
    significanceText = "Statistically Significant";
    significanceEmoji = "✅";
  } else if (confidence >= requiredConfidence - 0.05) {
    significanceText = "Marginally Significant";
    significanceEmoji = "⚠️";
  } else {
    significanceText = "Not Significant";
    significanceEmoji = "❌";
  }

  // Determine winner
  let winnerText = "";
  if (isSignificant) {
    if (bRate > aRate) {
      winnerText = "**Winner: Variant B** outperforms A";
    } else if (aRate > bRate) {
      winnerText = "**Winner: Variant A** outperforms B";
    } else {
      winnerText = "**No difference** between variants";
    }
  } else {
    winnerText = "**No clear winner** - results not statistically significant";
  }

  // Build output
  let output = `# A/B Test Results\n\n`;

  output += `## Conversion Rates\n\n`;
  output += `| Variant | Conversions | Sample Size | Rate |\n`;
  output += `|---------|-------------|-------------|------|\n`;
  output += `| A (Control) | ${Stats.formatNumber(aConversions, 0, userSettings)} | ${Stats.formatNumber(aSize, 0, userSettings)} | ${Stats.formatPercent(aRate, 2, userSettings)} |\n`;
  output += `| B (Treatment) | ${Stats.formatNumber(bConversions, 0, userSettings)} | ${Stats.formatNumber(bSize, 0, userSettings)} | ${Stats.formatPercent(bRate, 2, userSettings)} |\n\n`;

  output += `## Results\n\n`;
  output += `- **Absolute Lift**: ${absoluteLift >= 0 ? '+' : ''}${Stats.formatPercent(absoluteLift, 2, userSettings)} points\n`;
  output += `- **Relative Lift**: ${relativeLift >= 0 ? '+' : ''}${Stats.formatPercent(relativeLift, 2, userSettings)}\n`;
  output += `- **Confidence Level**: ${Stats.formatPercent(confidence, 1, userSettings)} ${significanceEmoji}\n`;
  output += `- **p-value**: ${Stats.formatNumber(pValue, 4, userSettings)}\n\n`;

  output += `## Conclusion\n\n`;
  output += `${significanceEmoji} **${significanceText}** at ${Stats.formatPercent(requiredConfidence, 0, userSettings)} confidence level\n\n`;
  output += `${winnerText}\n\n`;

  if (!isSignificant) {
    output += `---\n\n`;
    output += `**Recommendation**: Continue running the test to gather more data. `;
    const minConversions = Math.min(aConversions, bConversions);
    if (minConversions < 100) {
      output += `You have fewer than 100 conversions in one variant - aim for at least 100-300 conversions per variant for reliable results.`;
    } else if (minConversions < 300) {
      output += `With current conversion rates, you may need more samples to detect this effect size.`;
    }
  }

  return new ReturnObject({
    status: "success",
    message: `A/B test: ${significanceText}`,
    payload: output
  });
};

// --- Command: sample_size ---
const sample_size = new Command({
  name: "sample_size",
  parameters: [
    new Parameter({type: "number", name: "conversions", helpText: "Current number of conversions", required: true}),
    new Parameter({type: "number", name: "total", helpText: "Current total sample size", required: true}),
    new Parameter({type: "number", name: "target_lift", helpText: "Target relative lift to detect (e.g., 0.1 for 10%)", required: true}),
    new Parameter({type: "number", name: "confidence", helpText: "Required confidence level (0-1)", default: 0.95, required: false})
  ],
  type: "insert",
  helpText: "Calculate required sample size for A/B tests based on current conversion rate and target lift.",
  tutorials: [
    new TutorialCommand({command: "sample_size(250, 10000, 0.1)", description: "Sample size for 10% lift at 2.5% baseline"}),
    new TutorialCommand({command: "sample_size(250, 10000, 0.2, 0.99)", description: "Sample size for 20% lift at 99% confidence"})
  ],
  extension: extensionRoot
});

sample_size.execute = function(payload) {
  const Stats = ctx.shared.Statistics;
  const params = this.getParsedParams(payload);
  const userSettings = payload.userSettings || null;

  const conversions = parseFloat(params[0]);
  const total = parseFloat(params[1]);
  const targetLift = parseFloat(params[2]);
  const confidence = params[3] !== undefined ? parseFloat(params[3]) : 0.95;

  // Validate inputs
  if (isNaN(conversions) || isNaN(total) || isNaN(targetLift)) {
    return new ReturnObject({
      status: "error",
      message: "All parameters must be numbers. Usage: sample_size(conversions, total, target_lift, [confidence])"
    });
  }

  if (total <= 0) {
    return new ReturnObject({
      status: "error",
      message: "Total sample size must be greater than 0."
    });
  }

  if (conversions < 0 || conversions > total) {
    return new ReturnObject({
      status: "error",
      message: "Conversions must be between 0 and total sample size."
    });
  }

  if (targetLift <= 0) {
    return new ReturnObject({
      status: "error",
      message: "Target lift must be greater than 0 (e.g., 0.1 for 10% improvement)."
    });
  }

  if (confidence <= 0 || confidence >= 1) {
    return new ReturnObject({
      status: "error",
      message: "Confidence level must be between 0 and 1 (e.g., 0.95 for 95%)."
    });
  }

  // Calculate baseline conversion rate
  const baselineRate = conversions / total;

  // Calculate target rate after lift
  const targetRate = baselineRate * (1 + targetLift);
  const absoluteEffect = targetRate - baselineRate;

  // Get z-scores for confidence and power (80% power is standard)
  // Z-alpha for two-tailed test
  const alpha = 1 - confidence;
  let zAlpha;
  if (confidence >= 0.99) {
    zAlpha = 2.576;
  } else if (confidence >= 0.95) {
    zAlpha = 1.96;
  } else if (confidence >= 0.90) {
    zAlpha = 1.645;
  } else {
    zAlpha = 1.28;  // 80%
  }

  const zBeta = 0.84;  // 80% power
  const power = 0.80;

  // Calculate sample size per variant using formula:
  // n = 2 * (zAlpha + zBeta)^2 * p * (1-p) / (MDE)^2
  // where p is pooled proportion and MDE is minimum detectable effect
  const pooledP = (baselineRate + targetRate) / 2;
  const numerator = 2 * Math.pow(zAlpha + zBeta, 2) * pooledP * (1 - pooledP);
  const denominator = Math.pow(absoluteEffect, 2);
  const sampleSizePerVariant = Math.ceil(numerator / denominator);
  const totalSampleSize = sampleSizePerVariant * 2;

  // Build output
  let output = `# Sample Size Calculator Results\n\n`;

  output += `## Your Current Metrics\n\n`;
  output += `- **Conversions**: ${Stats.formatNumber(conversions, 0, userSettings)}\n`;
  output += `- **Total Sample**: ${Stats.formatNumber(total, 0, userSettings)}\n`;
  output += `- **Baseline Conversion Rate**: ${Stats.formatPercent(baselineRate, 2, userSettings)}\n\n`;

  output += `## Target Effect\n\n`;
  output += `- **Relative Lift to Detect**: ${Stats.formatPercent(targetLift, 1, userSettings)}\n`;
  output += `- **Target Conversion Rate**: ${Stats.formatPercent(targetRate, 2, userSettings)}\n`;
  output += `- **Absolute Effect Size**: +${Stats.formatPercent(absoluteEffect, 2, userSettings)} points\n\n`;

  output += `## Required Sample Size\n\n`;
  output += `| Metric | Value |\n`;
  output += `|--------|-------|\n`;
  output += `| Per Variant | **${Stats.formatNumber(sampleSizePerVariant, 0, userSettings)}** |\n`;
  output += `| Total (Both Variants) | **${Stats.formatNumber(totalSampleSize, 0, userSettings)}** |\n`;
  output += `| Confidence Level | ${Stats.formatPercent(confidence, 0, userSettings)} |\n`;
  output += `| Statistical Power | ${Stats.formatPercent(power, 0, userSettings)} |\n\n`;

  output += `## What This Means\n\n`;
  output += `To detect a **${Stats.formatPercent(targetLift, 0, userSettings)} relative improvement** `;
  output += `(from ${Stats.formatPercent(baselineRate, 2, userSettings)} to ${Stats.formatPercent(targetRate, 2, userSettings)}) `;
  output += `with **${Stats.formatPercent(confidence, 0, userSettings)} confidence**, you need:\n\n`;
  output += `- **${Stats.formatNumber(sampleSizePerVariant, 0, userSettings)} visitors per variant**\n`;
  output += `- **${Stats.formatNumber(totalSampleSize, 0, userSettings)} total visitors** across both variants\n\n`;

  // Practical guidance
  output += `## Practical Guidance\n\n`;

  if (sampleSizePerVariant > 100000) {
    output += `⚠️ **Large Sample Required**: You need a very large sample size. Consider:\n`;
    output += `- Testing for a larger effect size (bigger changes)\n`;
    output += `- Accepting a lower confidence level\n`;
    output += `- Running the test longer\n\n`;
  } else if (sampleSizePerVariant > 10000) {
    output += `📊 **Moderate Sample Required**: This is typical for most A/B tests.\n\n`;
  } else {
    output += `✅ **Reasonable Sample Size**: This should be achievable for most websites.\n\n`;
  }

  output += `**Test Duration Estimate**:\n`;
  output += `- At 1,000 visitors/day: ~${Stats.formatNumber(Math.ceil(totalSampleSize / 1000), 0, userSettings)} days\n`;
  output += `- At 5,000 visitors/day: ~${Stats.formatNumber(Math.ceil(totalSampleSize / 5000), 0, userSettings)} days\n`;
  output += `- At 10,000 visitors/day: ~${Stats.formatNumber(Math.ceil(totalSampleSize / 10000), 0, userSettings)} days\n\n`;

  output += `**Important Reminders**:\n`;
  output += `- Run tests for at least 1-2 full business cycles (typically 1-2 weeks minimum)\n`;
  output += `- Don't peek at results early—this increases false positives\n`;
  output += `- Smaller effects require much larger samples to detect reliably`;

  return new ReturnObject({
    status: "success",
    message: `Sample size: ${sampleSizePerVariant.toLocaleString()} per variant`,
    payload: output
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

## Input Values (Edit These)
customers_start_of_month : 1000
new_customers : 100
churned_customers : 50

## Customer Count
customers_end_of_month : customers_start_of_month + new_customers - churned_customers = 1,050

## Churn & Retention Rates
monthly_churn_rate : churned_customers / customers_start_of_month = 0.05
monthly_retention_rate : 1 - monthly_churn_rate = 0.95

annual_churn_rate : 1 - (monthly_retention_rate ** 12) = 0.46
annual_retention_rate : 1 - annual_churn_rate = 0.54

## Customer Lifetime
average_lifetime_months : 1 / monthly_churn_rate = 20.00
average_lifetime_years : average_lifetime_months / 12 = 1.67

## Net Growth
net_customer_growth : new_customers - churned_customers = 50
net_growth_rate : net_customer_growth / customers_start_of_month = 0.05

---

## What This Means

**Your Churn Rate (Monthly)**
monthly_churn_rate * 100 = 5.00

**Your Churn Rate (Annual)**
annual_churn_rate * 100 = 46.00

**Your Retention Rate (Monthly)**
monthly_retention_rate * 100 = 95.00

**Your Retention Rate (Annual)**
annual_retention_rate * 100 = 54.00

**Average Customer Lifetime (Months)**
average_lifetime_months = 20.00

**Average Customer Lifetime (Years)**
average_lifetime_years = 1.67

**Industry Benchmarks**
- SaaS B2B - 5-7% monthly churn is healthy, under 5% is excellent
- SaaS B2C - 5-10% monthly churn is acceptable, under 5% is excellent
- E-commerce - 15-25% monthly churn is typical
- Subscription boxes - 10-15% monthly churn is typical

**Key Insight**
Even small churn improvements have huge impact. Reducing monthly churn from 5% to 4% increases customer lifetime by 25%.

**Next Steps**
- Monitor cohort churn (do newer customers churn faster?)
- Identify warning signals (decreased usage, support tickets)
- Compare revenue churn vs customer churn
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

## Input Values (Edit These)
average_revenue_per_month : 50
gross_margin : 0.70
monthly_churn_rate : 0.05
discount_rate : 0.10
customer_acquisition_cost : 150

## Retention Metrics
monthly_retention_rate : 1 - monthly_churn_rate = 0.95
average_customer_lifetime_months : 1 / monthly_churn_rate = 20.00

## LTV Calculation (Simple)
ltv_simple : average_revenue_per_month * average_customer_lifetime_months * gross_margin = 700.00

## LTV Calculation (With Discount Rate)
monthly_discount_rate : discount_rate / 12 = 0.0083
ltv_discounted : (average_revenue_per_month * gross_margin) / (monthly_churn_rate + monthly_discount_rate) = 600.00

## CAC Comparison
ltv_to_cac_ratio : ltv_simple / customer_acquisition_cost = 4.67
cac_payback_months : customer_acquisition_cost / (average_revenue_per_month * gross_margin) = 4.29

---

## What This Means

**Your LTV (Simple)**
ltv_simple = 700.00

**Your LTV (Discounted)**
ltv_discounted = 600.00

The discounted version accounts for the time value of money (future revenue is worth less than present revenue).

**Customer Lifetime (Months)**
average_customer_lifetime_months = 20.00

**LTV to CAC Ratio**
ltv_to_cac_ratio = 4.67

LTV to CAC benchmarks
- Under 1 - Losing money on customers
- 1 to 3 - Risky, hard to scale
- 3 to 5 - Healthy business
- Over 5 - Excellent unit economics

**CAC Payback (Months)**
cac_payback_months = 4.29

CAC Payback benchmarks
- Under 12 months - Excellent
- 12 to 18 months - Acceptable for B2B
- Over 18 months - Challenging for growth

**Ways to Increase LTV**
1. Increase ARPU through upsells, cross-sells, price increases
2. Improve retention by reducing churn
3. Expand customer base with land and expand strategy
4. Improve margins through operational efficiency

**Important Notes**
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

## Input Values (Edit These)
total_revenue : 100000
total_users : 5000
time_period_days : 30
previous_period_arpu : 19

## ARPU Calculation
arpu : total_revenue / total_users = 20.00

## Time Period Analysis
arpu_per_day : arpu / time_period_days = 0.67
arpu_per_month : arpu_per_day * 30 = 20.00
arpu_per_year : arpu_per_day * 365 = 243.33

## Growth Tracking
arpu_growth : arpu - previous_period_arpu = 1.00
arpu_growth_rate : arpu_growth / previous_period_arpu = 0.05

---

## What This Means

**Your ARPU**
arpu = 20.00

**ARPU Per Month**
arpu_per_month = 20.00

**ARPU Per Year**
arpu_per_year = 243.33

**ARPU Growth Rate**
arpu_growth_rate * 100 = 5.00

**Why ARPU Matters**
- Tracks revenue growth independent of user growth
- Helps identify monetization improvements
- Key metric for SaaS, subscriptions, and marketplaces
- Useful for forecasting and pricing decisions

**ARPU vs ARPPU**
- ARPU includes ALL users (paying and free)
- ARPPU only includes paying users
- ARPPU is always greater than or equal to ARPU

**Ways to Increase ARPU**
1. Upsell and cross-sell to move users to higher tiers
2. Add-ons for additional features or services
3. Regular pricing reviews and increases
4. Usage-based pricing to charge based on consumption
5. Reduce discounts and minimize promotional pricing
6. Premium features with high-value additions
7. Annual plans to encourage longer commitments

**Monthly ARPU Benchmarks**
- Consumer apps - 1 to 10 dollars
- Freemium SaaS - 10 to 50 dollars
- SMB SaaS - 50 to 500 dollars
- Enterprise SaaS - 500 to 10,000+ dollars`;

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

## Input Values (Edit These)
total_revenue : 100000
total_users : 5000
paying_users : 1000
time_period_days : 30

## ARPPU Calculation
arppu : total_revenue / paying_users = 100.00

## ARPU Comparison
arpu : total_revenue / total_users = 20.00
conversion_rate : paying_users / total_users = 0.20

## Relationship
arpu_from_arppu : arppu * conversion_rate = 20.00

## Time Period Analysis
arppu_per_month : (arppu / time_period_days) * 30 = 100.00
arppu_per_year : (arppu / time_period_days) * 365 = 1216.67

---

## What This Means

**Your ARPPU**
arppu = 100.00

**Your ARPU**
arpu = 20.00

**Conversion Rate**
conversion_rate * 100 = 20.00

**ARPPU Per Month**
arppu_per_month = 100.00

**ARPPU Per Year**
arppu_per_year = 1216.67

**The ARPU/ARPPU Relationship**
ARPU equals ARPPU times Conversion Rate

You can increase ARPU by
1. Increasing ARPPU (get paying users to pay more)
2. Increasing Conversion Rate (convert more free users)

**Interpreting Your Metrics**
- High ARPPU with Low Conversion - Premium product, conversion opportunity
- Low ARPPU with High Conversion - Affordable product, upsell opportunity
- High ARPPU with High Conversion - Strong product-market fit
- Low ARPPU with Low Conversion - Need product or pricing changes

**ARPPU Growth Strategies**
1. Tiered Pricing to create higher-value tiers
2. Feature Gating to reserve premium features for paid tiers
3. Usage Limits to encourage upgrades
4. Add-ons and Extensions for additional paid features
5. Annual Billing for larger upfront payments
6. Volume Pricing based on usage or seats
7. Professional Services like consulting and training

**Freemium Benchmarks**
- Conversion Rate of 2-5% is typical, 10%+ is excellent
- ARPPU to ARPU Ratio should be 10-50x depending on conversion rate
- Monitor both metrics and avoid optimizing one at expense of the other`;

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

## Input Values (Edit These)
cash_in_bank : 500000
monthly_revenue : 50000
monthly_expenses : 75000
expense_reduction_amount : 10000

## Monthly Burn Rate
monthly_burn : monthly_expenses - monthly_revenue = 25000.00

## Runway Calculation
months_of_runway : cash_in_bank / monthly_burn = 20.00
years_of_runway : months_of_runway / 12 = 1.67

## Cost Reduction Scenario
reduced_monthly_burn : monthly_burn - expense_reduction_amount = 15000.00
extended_runway_months : cash_in_bank / reduced_monthly_burn = 33.33

---

## What This Means

**Your Cash in Bank**
cash_in_bank = 500000.00

**Your Monthly Burn Rate**
monthly_burn = 25000.00

**Your Runway (Months)**
months_of_runway = 20.00

**Your Runway (Years)**
years_of_runway = 1.67

**With Cost Reduction - Extended Runway (Months)**
extended_runway_months = 33.33

**Runway Thresholds**
- Under 6 months - CRITICAL, fundraise immediately or cut costs
- 6 to 12 months - WARNING, start fundraising now (6-9 month process)
- 12 to 18 months - HEALTHY, good position
- Over 18 months - STRONG, excellent position for negotiations

**Extending Your Runway**

Option 1 - Increase Revenue
- Accelerate sales cycle
- Raise prices
- Launch new products
- Expand to new markets

Option 2 - Reduce Costs
- Cut non-essential spending
- Renegotiate contracts
- Reduce headcount
- Downsize office space

Option 3 - Raise Capital
- Start fundraising at 12-18 months runway
- Process typically takes 6-9 months
- Have backup plans if fundraising fails

**Important Considerations**
- Account for irregular expenses (annual contracts, equipment)
- Build in buffer for unexpected costs (typically 10-20%)
- Consider seasonal revenue variations
- Factor in upcoming growth investments
- Use Net burn (expenses minus revenue) for runway calculation`;

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

## Input Values (Edit These)

### Cost Structure
cost_per_customer_monthly : 10
support_cost_per_customer : 5
infrastructure_per_customer : 3

### Pricing Tiers
basic_price : 29
pro_price : 79
enterprise_price : 199

### Customer Acquisition
cac : 150
target_ltv_to_cac : 3

## Cost Analysis
total_cost_per_customer : cost_per_customer_monthly + support_cost_per_customer + infrastructure_per_customer = 18.00

## Basic Tier Analysis
basic_margin : (basic_price - total_cost_per_customer) / basic_price = 0.38
basic_profit_per_customer : basic_price - total_cost_per_customer = 11.00

## Professional Tier Analysis
pro_margin : (pro_price - total_cost_per_customer) / pro_price = 0.77
pro_profit_per_customer : pro_price - total_cost_per_customer = 61.00

## Enterprise Tier Analysis
enterprise_margin : (enterprise_price - total_cost_per_customer) / enterprise_price = 0.91
enterprise_profit_per_customer : enterprise_price - total_cost_per_customer = 181.00

## Customer Lifetime Requirements
basic_required_lifetime_months : (cac * target_ltv_to_cac) / basic_profit_per_customer = 40.91
pro_required_lifetime_months : (cac * target_ltv_to_cac) / pro_profit_per_customer = 7.38
enterprise_required_lifetime_months : (cac * target_ltv_to_cac) / enterprise_profit_per_customer = 2.49

## Price Positioning
price_jump_basic_to_pro : pro_price / basic_price = 2.72
price_jump_pro_to_enterprise : enterprise_price / pro_price = 2.52

---

## What This Means

**Total Cost Per Customer**
total_cost_per_customer = 18.00

**Basic Tier Margin**
basic_margin * 100 = 38.00

**Professional Tier Margin**
pro_margin * 100 = 77.00

**Enterprise Tier Margin**
enterprise_margin * 100 = 91.00

**Required Lifetime for Basic Customers (Months)**
basic_required_lifetime_months = 40.91

**Required Lifetime for Pro Customers (Months)**
pro_required_lifetime_months = 7.38

**Required Lifetime for Enterprise Customers (Months)**
enterprise_required_lifetime_months = 2.49

**Price Jump - Basic to Pro**
price_jump_basic_to_pro = 2.72

**Price Jump - Pro to Enterprise**
price_jump_pro_to_enterprise = 2.52

**Target Margins**
- 70-90% gross margin is typical for healthy SaaS
- Higher tiers should have better margins

**Ideal Tier Gaps**
- 2-5x between tiers is ideal
- Too small means no incentive to stay at lower tier
- Too large means too big a jump to upgrade

**Pricing Psychology**
1. Anchor with Highest Price - Show Enterprise first
2. Make Middle Tier Attractive - Most customers choose middle (65-75%)
3. Decoy Pricing - Use Basic as anchor to make Pro look good
4. Value Metric Pricing - Price on value delivered (seats, usage, features)

**Common Pricing Models**
1. Per-Seat - Price per user per month
2. Usage-Based - Price per action or volume
3. Tiered Features - Fixed price with feature differences
4. Hybrid - Combine models (base plus usage)

**Red Flags**
- Negative margin on any tier
- CAC greater than LTV on any tier
- All customers choosing lowest tier (price too high)
- All customers choosing highest tier (price too low)
- Under 2% conversion from free to paid`;

  return new ReturnObject({
    status: "success",
    message: "SaaS pricing helper template inserted",
    payload: template
  });
};
})();
