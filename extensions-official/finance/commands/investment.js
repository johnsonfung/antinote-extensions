// ===============================
// finance: Investment Command
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["finance"];
  const extensionRoot = ctx.root;
  const Calc = ctx.shared.Calculations;

  // --- Command: investment ---
  const investment = new Command({
    name: "investment",
    parameters: [
      new Parameter({type: "number", name: "initial", helpText: "Initial investment amount", default: 0}),
      new Parameter({type: "number", name: "annualContribution", helpText: "Annual contribution", default: 0}),
      new Parameter({type: "number", name: "monthlyContribution", helpText: "Monthly contribution", default: 0}),
      new Parameter({type: "number", name: "interestRate", helpText: "Annual interest rate (e.g., 7 for 7%)", default: 7}),
      new Parameter({type: "number", name: "years", helpText: "Investment period in years", default: 0}),
      new Parameter({type: "number", name: "months", helpText: "Additional months (added to years)", default: 0}),
      new Parameter({type: "number", name: "taxRate", helpText: "Tax rate on gains (e.g., 15 for 15%)", default: 0}),
      new Parameter({type: "number", name: "inflationRate", helpText: "Annual inflation rate (e.g., 3 for 3%)", default: 3})
    ],
    type: "insert",
    helpText: "Calculate investment growth with contributions, taxes, and inflation adjustment.",
    tutorials: [
      new TutorialCommand({command: "investment(10000, 5000, 500, 7, 30)", description: "Invest $10k initial + $5k yearly + $500 monthly at 7% for 30 years"}),
      new TutorialCommand({command: "investment(50000, 0, 1000, 8, 20, 0, 15, 3)", description: "Invest $50k + $1k/month at 8% for 20 years with 15% tax"})
    ],
    extension: extensionRoot
  });

  investment.execute = function(payload) {
    const params = this.getParsedParams(payload);
    const initial = parseFloat(params[0]) || 0;
    const annualContribution = parseFloat(params[1]) || 0;
    const monthlyContribution = parseFloat(params[2]) || 0;
    const annualRate = (parseFloat(params[3]) || 7) / 100;
    const years = parseFloat(params[4]) || 0;
    const months = parseFloat(params[5]) || 0;
    const taxRate = (parseFloat(params[6]) || 0) / 100;
    const inflationRate = (parseFloat(params[7]) || 3) / 100;

    const totalYears = Number(years) + (Number(months) / 12);

    if (initial < 0 || annualContribution < 0 || monthlyContribution < 0 || totalYears <= 0) {
      return new ReturnObject({status: "error", message: "Please provide valid investment parameters."});
    }

    // Calculate investment growth
    const futureValue = Calc.calculateInvestmentGrowth(initial, annualContribution, monthlyContribution, annualRate, totalYears);
    const totalContributions = Calc.calculateTotalContributions(initial, annualContribution, monthlyContribution, totalYears);
    const totalGains = futureValue - totalContributions;

    // Calculate taxes on gains
    const taxAmount = totalGains * taxRate;
    const afterTaxValue = futureValue - taxAmount;

    // Calculate present value (inflation-adjusted)
    const presentValue = Calc.calculatePV(afterTaxValue, totalYears, inflationRate);

    // Build output
    let output = `# Investment Analysis\n\n`;
    output += `## Investment Parameters\n`;
    output += `- **Initial Investment**: ${Calc.formatDollar(initial)}\n`;
    if (annualContribution > 0) {
      output += `- **Annual Contribution**: ${Calc.formatDollar(annualContribution)}\n`;
    }
    if (monthlyContribution > 0) {
      output += `- **Monthly Contribution**: ${Calc.formatDollar(monthlyContribution)}\n`;
    }
    output += `- **Expected Return**: ${Calc.formatPercent(annualRate)} annually\n`;
    output += `- **Time Horizon**: ${totalYears.toFixed(1)} years\n`;
    if (taxRate > 0) {
      output += `- **Tax Rate on Gains**: ${Calc.formatPercent(taxRate)}\n`;
    }
    output += `- **Assumed Inflation**: ${Calc.formatPercent(inflationRate)} annually\n\n`;

    output += `## Projected Results\n`;
    output += `- **Total Contributions**: ${Calc.formatDollar(totalContributions)}\n`;
    output += `- **Investment Total**: ${Calc.formatDollar(futureValue)}\n`;
    output += `- **Total Gains**: ${Calc.formatDollar(totalGains)}\n`;

    if (taxRate > 0) {
      output += `- **Tax on Gains**: ${Calc.formatDollar(taxAmount)}\n`;
      output += `- **After-Tax Value**: ${Calc.formatDollar(afterTaxValue)}\n`;
    }

    output += `- **Present Value (Inflation-Adjusted)**: ${Calc.formatDollar(presentValue)}\n`;
    output += `  - This is what your ${Calc.formatDollar(afterTaxValue)} will be worth in today's dollars\n\n`;

    output += `### What These Numbers Mean:\n`;
    output += `Starting with ${Calc.formatDollar(initial)}`;
    if (annualContribution > 0 || monthlyContribution > 0) {
      output += ` and contributing `;
      const contributions = [];
      if (monthlyContribution > 0) contributions.push(`${Calc.formatDollar(monthlyContribution)}/month`);
      if (annualContribution > 0) contributions.push(`${Calc.formatDollar(annualContribution)}/year`);
      output += contributions.join(" and ");
    }
    output += ` over ${totalYears.toFixed(1)} years, you'll contribute a total of ${Calc.formatDollar(totalContributions)}. `;

    output += `With an average annual return of ${Calc.formatPercent(annualRate)}, your investment will grow to ${Calc.formatDollar(futureValue)}, `;
    output += `earning ${Calc.formatDollar(totalGains)} in gains `;
    output += `(a ${((totalGains / totalContributions) * 100).toFixed(1)}% return on your contributions).\n\n`;

    if (taxRate > 0) {
      output += `After paying ${Calc.formatPercent(taxRate)} taxes on your gains (${Calc.formatDollar(taxAmount)}), `;
      output += `you'll have ${Calc.formatDollar(afterTaxValue)}. `;
    }

    output += `Adjusting for ${Calc.formatPercent(inflationRate)} annual inflation, `;
    output += `this amount will have the purchasing power of ${Calc.formatDollar(presentValue)} in today's dollars.\n\n`;

    // Calculate ROI metrics
    const roi = ((afterTaxValue - totalContributions) / totalContributions) * 100;
    const annualizedReturn = (Math.pow(afterTaxValue / totalContributions, 1 / totalYears) - 1) * 100;

    output += `### Key Metrics:\n`;
    output += `- **Total Return on Investment**: ${roi.toFixed(1)}%\n`;
    output += `- **Annualized Return**: ${annualizedReturn.toFixed(2)}%\n`;
    output += `- **Purchasing Power Ratio**: ${(presentValue / totalContributions).toFixed(2)}x\n`;

    return new ReturnObject({status: "success", message: "Investment analysis generated", payload: output});
  };
})();
