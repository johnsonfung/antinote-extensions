// ===============================
// finance: Loan and Mortgage Commands
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["finance"];
  const extensionRoot = ctx.root;
  const Calc = ctx.shared.Calculations;

  // --- Command: loan ---
  const loan = new Command({
    name: "loan",
    parameters: [
      new Parameter({type: "expression", name: "amount", helpText: "Loan amount (e.g., 10000 or 5000*2)", default: 10000, required: false}),
      new Parameter({type: "expression", name: "termInMonths", helpText: "Loan term in months (e.g., 60 or 5*12)", default: 60, required: false}),
      new Parameter({type: "expression", name: "interestRate", helpText: "Annual interest rate (e.g., 5 for 5% or 0.05*100)", default: 4, required: false}),
      new Parameter({type: "string", name: "compound", helpText: "Compounding frequency (annually, monthly)", default: "annually", required: false}),
      new Parameter({type: "string", name: "payback", helpText: "Payment frequency (monthly, biweekly)", default: "monthly", required: false})
    ],
    type: "insert",
    helpText: "Calculate loan payment, total interest, and generate amortization table.",
    tutorials: [
      new TutorialCommand({command: "loan", description: "Calculate $10k loan at 4% over 60 months (uses defaults)"}),
      new TutorialCommand({command: "loan(10000, 36, 5)", description: "Calculate $10k loan at 5% over 36 months"}),
      new TutorialCommand({command: "loan(25000, 5*12, 6.5, annually, monthly)", description: "Calculate $25k loan at 6.5% over 5 years (using expression 5*12)"})
    ],
    extension: extensionRoot
  });

  loan.execute = function(payload) {
    const params = this.getParsedParams(payload);

    // Parameters are already evaluated by getParsedParams for 'expression' type
    const amount = Number(params[0]) || 0;
    const termInMonths = Number(params[1]) || 0;
    const annualRate = (Number(params[2]) || 0) / 100; // Convert percentage to decimal
    const compound = params[3] || "annually";
    const payback = params[4] || "monthly";

    if (amount <= 0 || termInMonths <= 0 || annualRate < 0) {
      return new ReturnObject({status: "error", message: "Please provide valid loan amount, term, and interest rate."});
    }

    // Calculate payment frequency
    let paymentsPerYear = 12;
    if (payback === "biweekly") {
      paymentsPerYear = 26;
    }

    // Calculate compounding periods
    let compoundPeriodsPerYear = 1;
    if (compound === "monthly") {
      compoundPeriodsPerYear = 12;
    }

    // For simplicity, we'll use monthly compounding for monthly payments
    // This is the most common scenario
    const monthlyRate = annualRate / 12;
    const numberOfPayments = termInMonths;

    // Calculate monthly payment
    const payment = Calc.calculatePMT(amount, monthlyRate, numberOfPayments);

    // Generate amortization schedule
    const schedule = Calc.generateAmortization(amount, monthlyRate, numberOfPayments, payment);

    // Calculate totals
    const totalPayments = payment * numberOfPayments;
    const totalInterest = totalPayments - amount;

    // Build output
    let output = `# Loan Analysis\n\n`;
    output += `## Loan Details\n`;
    output += `- **Loan Amount**: ${Calc.formatDollar(amount)}\n`;
    output += `- **Interest Rate**: ${Calc.formatPercent(annualRate)} annually\n`;
    output += `- **Term**: ${termInMonths} months (${(termInMonths / 12).toFixed(1)} years)\n`;
    output += `- **Compounding**: ${compound}\n`;
    output += `- **Payment Frequency**: ${payback}\n\n`;

    output += `## Payment Summary\n`;
    output += `- **Monthly Payment**: ${Calc.formatDollar(payment)}\n`;
    output += `- **Total Paid**: ${Calc.formatDollar(totalPayments)}\n`;
    output += `- **Total Interest**: ${Calc.formatDollar(totalInterest)}\n`;
    output += `- **Interest as % of Principal**: ${Calc.formatPercent(totalInterest / amount)}\n\n`;

    output += `### What These Numbers Mean:\n`;
    output += `Your monthly payment of ${Calc.formatDollar(payment)} includes both principal (paying down the loan) and interest (the cost of borrowing). `;
    output += `Over the life of the loan, you'll pay ${Calc.formatDollar(totalInterest)} in interest, which is ${((totalInterest / amount) * 100).toFixed(1)}% of the amount you borrowed. `;
    output += `Early payments are mostly interest, while later payments are mostly principal.\n\n`;

    output += `## Amortization Schedule (CSV)\n\n`;
    output += `\`\`\`csv\n`;
    output += Calc.amortizationToCSV(schedule);
    output += `\`\`\`\n`;

    return new ReturnObject({status: "success", message: "Loan analysis generated", payload: output});
  };

  // --- Command: mortgage ---
  const mortgage = new Command({
    name: "mortgage",
    parameters: [
      new Parameter({type: "expression", name: "homeCost", helpText: "Home purchase price (e.g., 500000)", default: 500000, required: false}),
      new Parameter({type: "expression", name: "downPaymentPercent", helpText: "Down payment as percentage (e.g., 20 for 20%)", default: 20, required: false}),
      new Parameter({type: "expression", name: "interestRate", helpText: "Annual interest rate (e.g., 6.5 for 6.5%)", default: 3.5, required: false}),
      new Parameter({type: "expression", name: "termInYears", helpText: "Loan term in years (e.g., 30 or 15)", default: 30, required: false})
    ],
    type: "insert",
    helpText: "Calculate mortgage payment, total interest, and generate amortization table.",
    tutorials: [
      new TutorialCommand({command: "mortgage", description: "Calculate mortgage for $500k home with 20% down at 3.5% (uses defaults)"}),
      new TutorialCommand({command: "mortgage(400000, 20, 6.5, 30)", description: "Calculate mortgage for $400k home with 20% down at 6.5%"}),
      new TutorialCommand({command: "mortgage(500000, 10, 7, 15)", description: "Calculate 15-year mortgage with 10% down at 7%"})
    ],
    extension: extensionRoot
  });

  mortgage.execute = function(payload) {
    const params = this.getParsedParams(payload);

    // Parameters are already evaluated by getParsedParams for 'expression' type
    const homeCost = Number(params[0]) || 500000;
    const downPaymentPercent = Number(params[1]) || 20;
    const annualRate = (Number(params[2]) || 3.5) / 100;
    const termInYears = Number(params[3]) || 30;

    if (homeCost <= 0 || downPaymentPercent < 0 || downPaymentPercent >= 100 || annualRate < 0 || termInYears <= 0) {
      return new ReturnObject({status: "error", message: "Please provide valid home cost, down payment percent (0-100), interest rate, and term."});
    }

    const downPayment = (downPaymentPercent / 100) * homeCost;
    const loanAmount = homeCost - downPayment;
    const monthlyRate = annualRate / 12;
    const numberOfPayments = termInYears * 12;

    // Calculate monthly payment
    const payment = Calc.calculatePMT(loanAmount, monthlyRate, numberOfPayments);

    // Generate amortization schedule
    const schedule = Calc.generateAmortization(loanAmount, monthlyRate, numberOfPayments, payment);

    // Calculate totals
    const totalPayments = payment * numberOfPayments;
    const totalInterest = totalPayments - loanAmount;
    const totalCost = homeCost + totalInterest;

    // Build output
    let output = `# Mortgage Analysis\n\n`;
    output += `## Home Purchase Details\n`;
    output += `- **Home Price**: ${Calc.formatDollar(homeCost)}\n`;
    output += `- **Down Payment**: ${Calc.formatDollar(downPayment)} (${downPaymentPercent.toFixed(1)}%)\n`;
    output += `- **Loan Amount**: ${Calc.formatDollar(loanAmount)}\n`;
    output += `- **Interest Rate**: ${Calc.formatPercent(annualRate)} annually\n`;
    output += `- **Term**: ${termInYears} years (${numberOfPayments} months)\n\n`;

    output += `## Payment Summary\n`;
    output += `- **Monthly Payment**: ${Calc.formatDollar(payment)}\n`;
    output += `  - Principal & Interest only (does not include taxes, insurance, HOA)\n`;
    output += `- **Total Paid Over Life of Loan**: ${Calc.formatDollar(totalPayments)}\n`;
    output += `- **Total Interest**: ${Calc.formatDollar(totalInterest)}\n`;
    output += `- **Total Cost of Home**: ${Calc.formatDollar(totalCost)} (price + interest)\n\n`;

    output += `### What These Numbers Mean:\n`;
    output += `With a ${downPaymentPercent.toFixed(1)}% down payment, you're financing ${Calc.formatDollar(loanAmount)}. `;
    output += `Your monthly payment of ${Calc.formatDollar(payment)} covers principal and interest only—you'll need to budget separately for property taxes, homeowners insurance, and any HOA fees. `;
    output += `Over ${termInYears} years, you'll pay ${Calc.formatDollar(totalInterest)} in interest, making the total cost of your home ${Calc.formatDollar(totalCost)}. `;

    if (downPaymentPercent < 20) {
      output += `\n\n⚠️ **Note**: With less than 20% down, you may be required to pay Private Mortgage Insurance (PMI), which would increase your monthly payment.\n`;
    }

    output += `\n## Amortization Schedule (CSV)\n\n`;
    output += `\`\`\`csv\n`;
    output += Calc.amortizationToCSV(schedule);
    output += `\`\`\`\n`;

    return new ReturnObject({status: "success", message: "Mortgage analysis generated", payload: output});
  };
})();
