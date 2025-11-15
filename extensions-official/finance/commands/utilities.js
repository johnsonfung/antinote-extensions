// ===============================
// finance: Utility Commands (PV, FV, Tax)
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["finance"];
  const extensionRoot = ctx.root;
  const Calc = ctx.shared.Calculations;

  // --- Command: pv (Present Value) ---
  const pv = new Command({
    name: "pv",
    parameters: [
      new Parameter({type: "expression", name: "futureAmount", helpText: "Amount in the future", default: 0}),
      new Parameter({type: "expression", name: "years", helpText: "Number of years", default: 0}),
      new Parameter({type: "expression", name: "riskFreeRate", helpText: "Discount rate (default 4%)", default: 4}),
      new Parameter({type: "bool", name: "showAnalysis", helpText: "Show detailed analysis", default: false})
    ],
    type: "insert",
    helpText: "Calculate the present value of a future amount.",
    tutorials: [
      new TutorialCommand({command: "PV(100000, 10)", description: "Present value of $100k in 10 years at 4%"}),
      new TutorialCommand({command: "PV(250000, 20, 5)", description: "Present value of $250k in 20 years at 5%"})
    ],
    extension: extensionRoot
  });

  pv.execute = function(payload) {
    const params = this.getParsedParams(payload);

    // Parameters are already evaluated by getParsedParams for 'expression' type
    const futureAmount = params[0] || 0;
    const years = params[1] || 0;
    const rate = (params[2] || 4) / 100;
    const showAnalysis = params[3];

    if (futureAmount <= 0 || years < 0) {
      return new ReturnObject({status: "error", message: "Please provide valid future amount and time period."});
    }

    const presentValue = Calc.calculatePV(futureAmount, years, rate);

    // If showAnalysis is false, just return the present value
    if (!showAnalysis) {
      return new ReturnObject({status: "success", message: "Present value calculated", payload: Calc.formatDollar(presentValue)});
    }

    const totalDiscount = futureAmount - presentValue;
    const discountPercent = (totalDiscount / futureAmount) * 100;

    let output = `# Present Value Analysis\n\n`;
    output += `## Calculation\n`;
    output += `- **Future Amount**: ${Calc.formatDollar(futureAmount)}\n`;
    output += `- **Time Period**: ${years} years\n`;
    output += `- **Discount Rate**: ${Calc.formatPercent(rate)}\n`;
    output += `- **Present Value**: ${Calc.formatDollar(presentValue)}\n\n`;

    output += `## Breakdown\n`;
    output += `- **Total Discount**: ${Calc.formatDollar(totalDiscount)} (${discountPercent.toFixed(1)}%)\n`;
    output += `- **Value Ratio**: ${(presentValue / futureAmount).toFixed(4)} (today's value / future value)\n\n`;

    output += `### What This Means:\n`;
    output += `${Calc.formatDollar(futureAmount)} received ${years} years from now is worth only ${Calc.formatDollar(presentValue)} in today's dollars, `;
    output += `assuming a ${Calc.formatPercent(rate)} discount rate (opportunity cost or risk-free rate).\n\n`;

    output += `This concept is crucial for:\n`;
    output += `- **Investment decisions**: Compare returns across different time periods\n`;
    output += `- **Pension valuations**: Understanding the real value of future payments\n`;
    output += `- **Business analysis**: Evaluating long-term projects and cash flows\n\n`;

    output += `The discount rate represents your opportunity cost—what you could earn by investing that money elsewhere. `;
    output += `A higher discount rate means future money is worth less today (more risk or better alternatives available).\n`;

    return new ReturnObject({status: "success", message: "Present value calculated", payload: output});
  };

  // --- Command: fv_simple (Simple Future Value) ---
  const fv_simple = new Command({
    name: "fv_simple",
    parameters: [
      new Parameter({type: "expression", name: "presentAmount", helpText: "Amount today", default: 0}),
      new Parameter({type: "expression", name: "years", helpText: "Number of years", default: 0}),
      new Parameter({type: "expression", name: "returnRate", helpText: "Expected return rate (default 4%)", default: 4}),
      new Parameter({type: "bool", name: "showAnalysis", helpText: "Show detailed analysis", default: false})
    ],
    type: "insert",
    helpText: "Calculate the future value of a present amount (simple calculation).",
    tutorials: [
      new TutorialCommand({command: "fv_simple(10000, 10)", description: "Future value of $10k in 10 years at 4%"}),
      new TutorialCommand({command: "fv_simple(50000, 30, 7)", description: "Future value of $50k in 30 years at 7%"})
    ],
    extension: extensionRoot
  });

  fv_simple.execute = function(payload) {
    const params = this.getParsedParams(payload);

    // Parameters are already evaluated by getParsedParams for 'expression' type
    const presentAmount = params[0] || 0;
    const years = params[1] || 0;
    const rate = (params[2] || 4) / 100;
    const showAnalysis = params[3];

    if (presentAmount <= 0 || years < 0) {
      return new ReturnObject({status: "error", message: "Please provide valid present amount and time period."});
    }

    const futureValue = Calc.calculateFV(presentAmount, years, rate);

    // If showAnalysis is false, just return the future value
    if (!showAnalysis) {
      return new ReturnObject({status: "success", message: "Future value calculated", payload: Calc.formatDollar(futureValue)});
    }

    const totalGrowth = futureValue - presentAmount;
    const growthMultiple = futureValue / presentAmount;

    let output = `# Future Value Analysis\n\n`;
    output += `## Calculation\n`;
    output += `- **Present Amount**: ${Calc.formatDollar(presentAmount)}\n`;
    output += `- **Time Period**: ${years} years\n`;
    output += `- **Expected Return**: ${Calc.formatPercent(rate)}\n`;
    output += `- **Future Value**: ${Calc.formatDollar(futureValue)}\n\n`;

    output += `## Growth Analysis\n`;
    output += `- **Total Growth**: ${Calc.formatDollar(totalGrowth)}\n`;
    output += `- **Growth Multiple**: ${growthMultiple.toFixed(2)}x\n`;
    output += `- **Average Annual Growth**: ${Calc.formatDollar(totalGrowth / years)}\n\n`;

    output += `### What This Means:\n`;
    output += `${Calc.formatDollar(presentAmount)} invested today will grow to ${Calc.formatDollar(futureValue)} in ${years} years, `;
    output += `assuming a ${Calc.formatPercent(rate)} annual return. That's a ${growthMultiple.toFixed(2)}x increase in value.\n\n`;

    output += `**The Power of Compound Interest**: Your money earns returns, and those returns earn returns. `;
    output += `Each year, you're earning ${Calc.formatPercent(rate)} not just on your original ${Calc.formatDollar(presentAmount)}, `;
    output += `but on all the growth accumulated so far.\n\n`;

    // Calculate rule of 72 approximation
    const doublingTime = 72 / (rate * 100);
    output += `**Rule of 72**: At ${Calc.formatPercent(rate)}, your money doubles approximately every ${doublingTime.toFixed(1)} years.\n`;

    return new ReturnObject({status: "success", message: "Future value calculated", payload: output});
  };

  // --- Command: tax ---
  const tax = new Command({
    name: "tax",
    parameters: [
      new Parameter({type: "expression", name: "amount", helpText: "Pre-tax amount (e.g., 100000 or 50000*2)", default: 50000}),
      new Parameter({type: "expression", name: "averageTaxRate", helpText: "Average tax rate (e.g., 25 for 25%)", default: 12}),
      new Parameter({type: "bool", name: "showAnalysis", helpText: "Show detailed analysis", default: false})
    ],
    type: "insert",
    helpText: "Calculate tax amount and after-tax income.",
    tutorials: [
      new TutorialCommand({command: "tax(100000, 22)", description: "Calculate tax on $100k at 22% rate"}),
      new TutorialCommand({command: "tax(250000, 28.5)", description: "Calculate tax on $250k at 28.5% rate"})
    ],
    extension: extensionRoot
  });

  tax.execute = function(payload) {
    const params = this.getParsedParams(payload);

    // Parameters are already evaluated by getParsedParams for 'expression' type
    const amount = params[0] || 50000;
    const taxRate = (params[1] || 12) / 100;
    const showAnalysis = params[2];

    if (amount < 0 || taxRate < 0) {
      return new ReturnObject({status: "error", message: "Please provide valid amount and tax rate."});
    }

    const taxAmount = amount * taxRate;
    const afterTax = amount - taxAmount;
    const takeHomePercent = (afterTax / amount) * 100;

    // If showAnalysis is false, just return the summary
    if (!showAnalysis) {
      let summary = `**Pre-Tax Amount**: ${Calc.formatDollar(amount)}\n`;
      summary += `**Tax Rate**: ${Calc.formatPercent(taxRate)}\n`;
      summary += `**Tax Amount**: ${Calc.formatDollar(taxAmount)}\n`;
      summary += `**After-Tax Amount**: ${Calc.formatDollar(afterTax)}`;
      return new ReturnObject({status: "success", message: "Tax calculated", payload: summary});
    }

    let output = `# Tax Calculation\n\n`;
    output += `## Summary\n`;
    output += `- **Pre-Tax Amount**: ${Calc.formatDollar(amount)}\n`;
    output += `- **Tax Rate**: ${Calc.formatPercent(taxRate)}\n`;
    output += `- **Tax Amount**: ${Calc.formatDollar(taxAmount)}\n`;
    output += `- **After-Tax Amount**: ${Calc.formatDollar(afterTax)}\n\n`;

    output += `## Breakdown\n`;
    output += `- **Take-Home Percentage**: ${takeHomePercent.toFixed(1)}%\n`;
    if (taxRate > 0) {
      output += `- **Monthly After-Tax** (if annual): ${Calc.formatDollar(afterTax / 12)}\n`;
      output += `- **Bi-Weekly After-Tax** (if annual): ${Calc.formatDollar(afterTax / 26)}\n`;
    }
    output += `\n`;

    output += `### What This Means:\n`;
    output += `At a ${Calc.formatPercent(taxRate)} average tax rate, you'll pay ${Calc.formatDollar(taxAmount)} in taxes on ${Calc.formatDollar(amount)}, `;
    output += `leaving you with ${Calc.formatDollar(afterTax)} after taxes. That's ${takeHomePercent.toFixed(1)}% of your pre-tax amount.\n\n`;

    output += `**Important Notes**:\n`;
    output += `- This uses an **average** (effective) tax rate, not a marginal rate\n`;
    output += `- Your marginal rate (rate on the last dollar earned) is usually higher\n`;
    output += `- Doesn't include deductions, credits, or state/local taxes\n`;
    output += `- For accurate tax planning, consult a tax professional or use tax software\n\n`;

    output += `**Tax Rate Types**:\n`;
    output += `- **Marginal Rate**: Tax rate on your last dollar of income\n`;
    output += `- **Effective Rate**: Average rate across all your income (total tax ÷ total income)\n`;
    output += `- **Average Rate**: This calculator uses effective/average rate\n`;

    return new ReturnObject({status: "success", message: "Tax calculation complete", payload: output});
  };
})();
