// ===============================
// finance: FIRE (Financial Independence, Retire Early) Commands
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["finance"];
  const extensionRoot = ctx.root;
  const Calc = ctx.shared.Calculations;

  // --- Command: fire_amount ---
  const fire_amount = new Command({
    name: "fire_amount",
    parameters: [
      new Parameter({type: "number", name: "amountSaved", helpText: "Total amount saved", default: 0}),
      new Parameter({type: "number", name: "interestRate", helpText: "Safe withdrawal rate (default 4%)", default: 4})
    ],
    type: "insert",
    helpText: "Calculate annual income from investments using the safe withdrawal rate.",
    tutorials: [
      new TutorialCommand({command: "fire_amount(1000000)", description: "Calculate annual income from $1M at 4% withdrawal"}),
      new TutorialCommand({command: "fire_amount(2500000, 3.5)", description: "Calculate annual income from $2.5M at 3.5% withdrawal"})
    ],
    extension: extensionRoot
  });

  fire_amount.execute = function(payload) {
    const params = this.getParsedParams(payload);
    const amountSaved = parseFloat(params[0]) || 0;
    const withdrawalRate = (parseFloat(params[1]) || 4) / 100;

    if (amountSaved <= 0) {
      return new ReturnObject({status: "error", message: "Please provide a valid amount saved."});
    }

    const annualIncome = amountSaved * withdrawalRate;
    const monthlyIncome = annualIncome / 12;

    // Calculate how much you need for different expense levels
    const expenses25k = 25000 / withdrawalRate;
    const expenses50k = 50000 / withdrawalRate;
    const expenses75k = 75000 / withdrawalRate;
    const expenses100k = 100000 / withdrawalRate;

    let output = `# FIRE Income Analysis\n\n`;
    output += `## Your Numbers\n`;
    output += `- **Investment Portfolio**: ${Calc.formatDollar(amountSaved)}\n`;
    output += `- **Safe Withdrawal Rate**: ${Calc.formatPercent(withdrawalRate)}\n`;
    output += `- **Annual Income**: ${Calc.formatDollar(annualIncome)}\n`;
    output += `- **Monthly Income**: ${Calc.formatDollar(monthlyIncome)}\n\n`;

    output += `### What This Means:\n`;
    output += `Using the ${Calc.formatPercent(withdrawalRate)} rule (a widely-used safe withdrawal rate), `;
    output += `you can withdraw ${Calc.formatDollar(annualIncome)} per year from your ${Calc.formatDollar(amountSaved)} portfolio `;
    output += `without depleting your principal. This assumes your investments continue to grow at roughly the withdrawal rate.\n\n`;

    output += `The ${Calc.formatPercent(withdrawalRate)} rule is based on historical market data suggesting this withdrawal rate `;
    output += `provides a high probability of your portfolio lasting 30+ years, even through market downturns.\n\n`;

    output += `## FIRE Number Calculator\n`;
    output += `To support different annual expense levels, you would need:\n`;
    output += `- **$25,000/year**: ${Calc.formatDollar(expenses25k)} saved\n`;
    output += `- **$50,000/year**: ${Calc.formatDollar(expenses50k)} saved\n`;
    output += `- **$75,000/year**: ${Calc.formatDollar(expenses75k)} saved\n`;
    output += `- **$100,000/year**: ${Calc.formatDollar(expenses100k)} saved\n\n`;

    output += `**Rule of Thumb**: Multiply your annual expenses by 25 (for 4% withdrawal) to find your FIRE number.\n`;

    return new ReturnObject({status: "success", message: "FIRE income analysis generated", payload: output});
  };

  // --- Command: fire_plan ---
  const fire_plan = new Command({
    name: "fire_plan",
    parameters: [
      new Parameter({type: "number", name: "currentSavings", helpText: "Current savings/investments", default: 0}),
      new Parameter({type: "number", name: "monthlyAdditions", helpText: "Monthly contribution to savings", default: 0}),
      new Parameter({type: "number", name: "monthlyExpensesAtRetirement", helpText: "Expected monthly expenses in retirement", default: 0}),
      new Parameter({type: "number", name: "returnRatePreFIRE", helpText: "Investment return before retirement (default 7%)", default: 7}),
      new Parameter({type: "number", name: "returnRatePostFIRE", helpText: "Safe withdrawal rate after retirement (default 4%)", default: 4}),
      new Parameter({type: "number", name: "inflationRate", helpText: "Annual inflation rate (default 3%)", default: 3})
    ],
    type: "insert",
    helpText: "Calculate path to financial independence and retirement timeline.",
    tutorials: [
      new TutorialCommand({command: "fire_plan(100000, 3000, 5000)", description: "Plan FIRE with $100k saved, saving $3k/month, $5k/month expenses"}),
      new TutorialCommand({command: "fire_plan(250000, 5000, 7500, 8, 4, 3)", description: "Custom FIRE plan with 8% pre-FIRE returns"})
    ],
    extension: extensionRoot
  });

  fire_plan.execute = function(payload) {
    const params = this.getParsedParams(payload);
    const currentSavings = parseFloat(params[0]) || 0;
    const monthlyAdditions = parseFloat(params[1]) || 0;
    const monthlyExpenses = parseFloat(params[2]) || 0;
    const preFireRate = (parseFloat(params[3]) || 7) / 100;
    const postFireRate = (parseFloat(params[4]) || 4) / 100;
    const inflationRate = (parseFloat(params[5]) || 3) / 100;

    if (currentSavings < 0 || monthlyAdditions < 0 || monthlyExpenses <= 0) {
      return new ReturnObject({status: "error", message: "Please provide valid savings, contributions, and expense amounts."});
    }

    // Calculate FIRE number (amount needed to retire)
    const annualExpenses = monthlyExpenses * 12;
    const fireNumber = annualExpenses / postFireRate;

    // Calculate years to FIRE
    let yearsToFIRE = 0;
    let balance = currentSavings;
    const monthlyPreFireRate = preFireRate / 12;

    if (balance >= fireNumber) {
      yearsToFIRE = 0;
    } else if (monthlyAdditions === 0) {
      // No contributions - just compound growth
      yearsToFIRE = Math.log(fireNumber / balance) / Math.log(1 + preFireRate);
    } else {
      // Calculate with monthly contributions
      let months = 0;
      const maxMonths = 100 * 12; // 100 year cap

      while (balance < fireNumber && months < maxMonths) {
        balance = balance * (1 + monthlyPreFireRate) + monthlyAdditions;
        months++;
      }

      yearsToFIRE = months / 12;
    }

    // Calculate future value at FIRE
    const fvNestEgg = fireNumber;

    // Calculate inflation-adjusted expenses at retirement
    const fvMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationRate, yearsToFIRE);
    const fvAnnualExpenses = fvMonthlyExpenses * 12;

    // Calculate present value of expenses
    const pvMonthlyExpenses = monthlyExpenses;

    // Verify the math
    const withdrawalAmount = fvNestEgg * postFireRate;

    let output = `# FIRE Plan\n\n`;
    output += `## Current Situation\n`;
    output += `- **Current Savings**: ${Calc.formatDollar(currentSavings)}\n`;
    output += `- **Monthly Contributions**: ${Calc.formatDollar(monthlyAdditions)}\n`;
    output += `- **Monthly Expenses (Today)**: ${Calc.formatDollar(monthlyExpenses)}\n`;
    output += `- **Annual Expenses (Today)**: ${Calc.formatDollar(annualExpenses)}\n\n`;

    output += `## Your FIRE Number\n`;
    output += `- **Target Portfolio**: ${Calc.formatDollar(fireNumber)}\n`;
    output += `- **Based On**: ${Calc.formatPercent(postFireRate)} safe withdrawal rate\n`;
    output += `- **Gap to Close**: ${Calc.formatDollar(Math.max(0, fireNumber - currentSavings))}\n\n`;

    if (yearsToFIRE >= 100) {
      output += `## ⚠️ Timeline Not Achievable\n`;
      output += `With your current savings rate, reaching FIRE would take over 100 years. Consider:\n`;
      output += `- Increasing monthly contributions\n`;
      output += `- Reducing retirement expenses\n`;
      output += `- Pursuing higher investment returns\n`;
    } else {
      output += `## Timeline to FIRE\n`;
      output += `- **Years Until Financial Independence**: ${yearsToFIRE.toFixed(1)} years\n`;
      output += `- **Target Date**: ${new Date(new Date().getFullYear() + Math.ceil(yearsToFIRE), new Date().getMonth()).toLocaleDateString('en-US', {year: 'numeric', month: 'long'})}\n`;
      output += `- **Age at FIRE** (if you're 30 now): ${30 + Math.ceil(yearsToFIRE)} years old\n\n`;

      output += `## Portfolio at Retirement\n`;
      output += `- **Future Value of Nest Egg**: ${Calc.formatDollar(fvNestEgg)}\n`;
      output += `- **Annual Withdrawal Amount**: ${Calc.formatDollar(withdrawalAmount)}\n`;
      output += `- **Monthly Withdrawal Amount**: ${Calc.formatDollar(withdrawalAmount / 12)}\n\n`;

      output += `## Inflation-Adjusted Expenses\n`;
      output += `- **Monthly Expenses at Retirement**: ${Calc.formatDollar(fvMonthlyExpenses)}\n`;
      output += `- **Annual Expenses at Retirement**: ${Calc.formatDollar(fvAnnualExpenses)}\n`;
      output += `- **Present Value (Today's Dollars)**: ${Calc.formatDollar(pvMonthlyExpenses)}/month\n\n`;

      output += `### What This Means:\n`;
      output += `Based on your current trajectory of saving ${Calc.formatDollar(monthlyAdditions)} per month, `;
      output += `you'll reach financial independence in approximately **${yearsToFIRE.toFixed(1)} years**. `;
      output += `At that point, you'll have ${Calc.formatDollar(fvNestEgg)} saved, allowing you to withdraw `;
      output += `${Calc.formatDollar(withdrawalAmount / 12)} per month (${Calc.formatPercent(postFireRate)} safe withdrawal rate).\n\n`;

      output += `Your expenses will grow with ${Calc.formatPercent(inflationRate)} inflation to ${Calc.formatDollar(fvMonthlyExpenses)}/month `;
      output += `in future dollars, which equals your current ${Calc.formatDollar(pvMonthlyExpenses)}/month in purchasing power.\n\n`;

      // Calculate savings rate
      const currentAnnualIncome = monthlyAdditions * 12 + annualExpenses; // Rough estimate
      const savingsRate = (monthlyAdditions * 12) / currentAnnualIncome * 100;

      output += `### Key Assumptions:\n`;
      output += `- **Pre-FIRE Investment Return**: ${Calc.formatPercent(preFireRate)} annually\n`;
      output += `- **Post-FIRE Safe Withdrawal**: ${Calc.formatPercent(postFireRate)} annually\n`;
      output += `- **Inflation Rate**: ${Calc.formatPercent(inflationRate)} annually\n`;
      output += `- **Estimated Savings Rate**: ${savingsRate.toFixed(1)}%\n\n`;

      output += `### Ways to Accelerate FIRE:\n`;
      output += `1. **Increase savings rate**: Every $100/month extra saves ~${(100 * 12 * yearsToFIRE / fireNumber * 100).toFixed(2)}% more time\n`;
      output += `2. **Reduce expenses**: Every $100/month less in retirement reduces your FIRE number by ${Calc.formatDollar(100 * 12 / postFireRate)}\n`;
      output += `3. **Boost returns**: Just 1% higher return could shave years off your timeline\n`;
    }

    return new ReturnObject({status: "success", message: "FIRE plan generated", payload: output});
  };
})();
