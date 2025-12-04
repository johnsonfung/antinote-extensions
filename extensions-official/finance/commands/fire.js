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
      new Parameter({type: "expression", name: "amountSaved", helpText: "Total amount saved (e.g., 1000000 or 500000*2)", default: 1000000, required: true}),
      new Parameter({type: "expression", name: "interestRate", helpText: "Safe withdrawal rate (default 4%)", default: 4, required: false})
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

    // Parameters are already evaluated by getParsedParams for 'expression' type
    const amountSaved = params[0] || 0;
    const withdrawalRate = (params[1] || 4) / 100;

    if (amountSaved <= 0) {
      return new ReturnObject({status: "error", message: "Please provide a valid amount saved."});
    }

    const annualIncome = amountSaved * withdrawalRate;
    const monthlyIncome = annualIncome / 12;

    // Calculate how much you need for different expense levels
    const expenses50k = 50000 / withdrawalRate;
    const expenses100k = 100000 / withdrawalRate;
    const expenses150k = 150000 / withdrawalRate;
    const expenses200k = 200000 / withdrawalRate;
    const expenses250k = 250000 / withdrawalRate;
    const expenses300k = 300000 / withdrawalRate;

    let output = `# FIRE Income Analysis\n\n`;
    output += `## Your Numbers\n`;
    output += `- **Investment Portfolio**: ${Calc.formatDollar(amountSaved)}\n`;
    output += `- **Safe Withdrawal Rate**: ${Calc.formatPercent(withdrawalRate)}\n`;
    output += `- **Annual Income**: ${Calc.formatDollar(annualIncome)}\n`;
    output += `- **Monthly Income**: ${Calc.formatDollar(monthlyIncome)}\n\n`;

    output += `### What This Means:\n`;
    output += `At a ${Calc.formatPercent(withdrawalRate)} withdrawal rate, `;
    output += `you can withdraw ${Calc.formatDollar(annualIncome)} per year from your ${Calc.formatDollar(amountSaved)} portfolio.\n\n`;

    if (withdrawalRate === 0.04) {
      output += `The 4.00% rule is based on the Trinity Study and historical market data, suggesting this withdrawal rate `;
      output += `provides a high probability of your portfolio lasting 30+ years, even through market downturns.\n\n`;
    } else if (withdrawalRate < 0.04) {
      output += `A ${Calc.formatPercent(withdrawalRate)} withdrawal rate is more conservative than the traditional 4% rule, `;
      output += `which may provide greater portfolio longevity and a larger safety margin against market downturns.\n\n`;
    } else {
      output += `**Note:** A ${Calc.formatPercent(withdrawalRate)} withdrawal rate is higher than the traditional 4% rule. `;
      output += `Higher withdrawal rates increase the risk of depleting your portfolio over a 30-year retirement, `;
      output += `especially during extended market downturns. Consider your risk tolerance and retirement timeline carefully.\n\n`;
    }

    output += `## FIRE Number Calculator\n`;
    output += `To support different annual expense levels, you would need:\n`;
    output += `- **$50,000/year**: ${Calc.formatDollar(expenses50k)} saved\n`;
    output += `- **$100,000/year**: ${Calc.formatDollar(expenses100k)} saved\n`;
    output += `- **$150,000/year**: ${Calc.formatDollar(expenses150k)} saved\n`;
    output += `- **$200,000/year**: ${Calc.formatDollar(expenses200k)} saved\n`;
    output += `- **$250,000/year**: ${Calc.formatDollar(expenses250k)} saved\n`;
    output += `- **$300,000/year**: ${Calc.formatDollar(expenses300k)} saved\n\n`;

    output += `**Rule of Thumb**: Multiply your annual expenses by 25 (for 4% withdrawal) to find your FIRE number.\n`;

    return new ReturnObject({status: "success", message: "FIRE income analysis generated", payload: output});
  };

  // --- Command: fire_plan ---
  const fire_plan = new Command({
    name: "fire_plan",
    parameters: [
      new Parameter({type: "expression", name: "currentSavings", helpText: "Current savings/investments", default: 100000, required: true}),
      new Parameter({type: "expression", name: "monthlyAdditions", helpText: "Monthly contribution to savings", default: 3000, required: true}),
      new Parameter({type: "expression", name: "monthlyExpensesAtRetirement", helpText: "Expected monthly expenses in retirement", default: 5000, required: true}),
      new Parameter({type: "expression", name: "returnRatePreFIRE", helpText: "Investment return before retirement (default 7%)", default: 7, required: false}),
      new Parameter({type: "expression", name: "returnRatePostFIRE", helpText: "Safe withdrawal rate after retirement (default 4%)", default: 4, required: false}),
      new Parameter({type: "expression", name: "inflationRate", helpText: "Annual inflation rate (default 3%)", default: 3, required: false})
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

    // Parameters are already evaluated by getParsedParams for 'expression' type
    const currentSavings = params[0] || 0;
    const monthlyAdditions = params[1] || 0;
    const monthlyExpenses = params[2] || 0;
    const preFireRate = (params[3] || 7) / 100;
    const postFireRate = (params[4] || 4) / 100;
    const inflationRate = (params[5] || 3) / 100;

    if (currentSavings < 0 || monthlyAdditions < 0 || monthlyExpenses <= 0) {
      return new ReturnObject({status: "error", message: "Please provide valid savings, contributions, and expense amounts."});
    }

    // Today's annual expenses and FIRE number (for reference)
    const annualExpenses = monthlyExpenses * 12;
    const fireNumberToday = annualExpenses / postFireRate;

    // Calculate years to FIRE with inflation-adjusted target
    // The FIRE number grows with inflation, so we need to find when portfolio >= inflation-adjusted FIRE number
    let yearsToFIRE = 0;
    let balance = currentSavings;
    const monthlyPreFireRate = preFireRate / 12;
    const monthlyInflationRate = Math.pow(1 + inflationRate, 1/12) - 1;

    // Calculate the inflation-adjusted FIRE number at month 0
    let currentFireNumber = fireNumberToday;

    if (balance >= currentFireNumber) {
      yearsToFIRE = 0;
    } else {
      // Calculate with monthly contributions and inflation-adjusted target
      let months = 0;
      const maxMonths = 100 * 12; // 100 year cap

      while (balance < currentFireNumber && months < maxMonths) {
        // Grow portfolio
        balance = balance * (1 + monthlyPreFireRate) + monthlyAdditions;
        // Grow FIRE target with inflation
        currentFireNumber = currentFireNumber * (1 + monthlyInflationRate);
        months++;
      }

      yearsToFIRE = months / 12;
    }

    // Calculate future values at FIRE
    const fvNestEgg = balance; // Actual portfolio value when FIRE is reached
    const fvFireNumber = currentFireNumber; // Inflation-adjusted FIRE target

    // Calculate inflation-adjusted expenses at retirement
    const fvMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationRate, yearsToFIRE);
    const fvAnnualExpenses = fvMonthlyExpenses * 12;

    // Calculate present value of expenses
    const pvMonthlyExpenses = monthlyExpenses;

    // Withdrawal amount based on the actual portfolio at FIRE
    const withdrawalAmount = fvNestEgg * postFireRate;

    let output = `# FIRE Plan\n\n`;
    output += `## Current Situation\n`;
    output += `- **Current Savings**: ${Calc.formatDollar(currentSavings)}\n`;
    output += `- **Monthly Contributions**: ${Calc.formatDollar(monthlyAdditions)}\n`;
    output += `- **Monthly Expenses (Today)**: ${Calc.formatDollar(monthlyExpenses)}\n`;
    output += `- **Annual Expenses (Today)**: ${Calc.formatDollar(annualExpenses)}\n\n`;

    output += `## Your FIRE Number\n`;
    output += `- **Target Portfolio (Today's Dollars)**: ${Calc.formatDollar(fireNumberToday)}\n`;
    output += `- **Target Portfolio (Inflation-Adjusted)**: ${Calc.formatDollar(fvFireNumber)}\n`;
    output += `- **Based On**: ${Calc.formatPercent(postFireRate)} safe withdrawal rate\n`;
    output += `- **Gap to Close (Today)**: ${Calc.formatDollar(Math.max(0, fireNumberToday - currentSavings))}\n\n`;

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
      output += `1. **Increase savings rate**: Higher monthly contributions accelerate portfolio growth\n`;
      output += `2. **Reduce expenses**: Every $100/month less in retirement reduces your FIRE number by ${Calc.formatDollar(100 * 12 / postFireRate)} (in today's dollars)\n`;
      output += `3. **Boost returns**: Higher investment returns help your portfolio outpace inflation\n`;
    }

    return new ReturnObject({status: "success", message: "FIRE plan generated", payload: output});
  };
})();
