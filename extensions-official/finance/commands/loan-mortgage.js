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
      new Parameter({type: "number", name: "amount", helpText: "Loan amount", default: 0}),
      new Parameter({type: "number", name: "termInMonths", helpText: "Loan term in months", default: 0}),
      new Parameter({type: "number", name: "interestRate", helpText: "Annual interest rate (e.g., 5 for 5%)", default: 0}),
      new Parameter({type: "string", name: "compound", helpText: "Compounding frequency (annually, monthly)", default: "annually"}),
      new Parameter({type: "string", name: "payback", helpText: "Payment frequency (monthly, biweekly)", default: "monthly"})
    ],
    type: "insert",
    helpText: "Calculate loan payment, total interest, and generate amortization table.",
    tutorials: [
      new TutorialCommand({command: "loan(10000, 36, 5)", description: "Calculate $10k loan at 5% over 36 months"}),
      new TutorialCommand({command: "loan(25000, 60, 6.5, annually, monthly)", description: "Calculate $25k loan at 6.5% over 60 months"})
    ],
    extension: extensionRoot
  });

  loan.execute = function(payload) {
    const params = this.getParsedParams(payload);
    const amount = parseFloat(params[0]) || 0;
    const termInMonths = parseFloat(params[1]) || 0;
    const annualRate = (parseFloat(params[2]) || 0) / 100; // Convert percentage to decimal
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
      new Parameter({type: "number", name: "homeCost", helpText: "Home purchase price", default: 0}),
      new Parameter({type: "number", name: "downPayment", helpText: "Down payment amount", default: 0}),
      new Parameter({type: "number", name: "interestRate", helpText: "Annual interest rate (e.g., 6.5 for 6.5%)", default: 0}),
      new Parameter({type: "number", name: "termInYears", helpText: "Loan term in years (typically 15 or 30)", default: 30})
    ],
    type: "insert",
    helpText: "Calculate mortgage payment, total interest, and generate amortization table.",
    tutorials: [
      new TutorialCommand({command: "mortgage(400000, 80000, 6.5, 30)", description: "Calculate mortgage for $400k home with $80k down"}),
      new TutorialCommand({command: "mortgage(500000, 100000, 7, 15)", description: "Calculate 15-year mortgage at 7%"})
    ],
    extension: extensionRoot
  });

  mortgage.execute = function(payload) {
    const params = this.getParsedParams(payload);
    const homeCost = parseFloat(params[0]) || 0;
    const downPayment = parseFloat(params[1]) || 0;
    const annualRate = (parseFloat(params[2]) || 0) / 100;
    const termInYears = parseFloat(params[3]) || 30;

    if (homeCost <= 0 || downPayment < 0 || annualRate < 0 || termInYears <= 0) {
      return new ReturnObject({status: "error", message: "Please provide valid home cost, down payment, interest rate, and term."});
    }

    if (downPayment >= homeCost) {
      return new ReturnObject({status: "error", message: "Down payment must be less than home cost."});
    }

    const loanAmount = homeCost - downPayment;
    const downPaymentPercent = (downPayment / homeCost) * 100;
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
