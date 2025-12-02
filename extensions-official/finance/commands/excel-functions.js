// ===============================
// finance: Excel-Compatible Functions (FV, PMT, NPV, IRR)
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["finance"];
  const extensionRoot = ctx.root;
  const Calc = ctx.shared.Calculations;

  // --- Command: fv (Excel-compatible Future Value) ---
  const fv = new Command({
    name: "fv",
    parameters: [
      new Parameter({type: "expression", name: "rate", helpText: "Interest rate per period (e.g., 0.05 or 0.05/12)", default: 0.05, required: true}),
      new Parameter({type: "expression", name: "nper", helpText: "Total number of payment periods", default: 10, required: true}),
      new Parameter({type: "expression", name: "pmt", helpText: "Payment per period (negative for outflows)", default: -1000, required: true}),
      new Parameter({type: "expression", name: "pv", helpText: "Present value (default 0)", default: 0, required: false}),
      new Parameter({type: "expression", name: "type", helpText: "0=end of period, 1=beginning (default 0)", default: 0, required: false}),
      new Parameter({type: "bool", name: "showAnalysis", helpText: "Show detailed analysis", default: false, required: false})
    ],
    type: "insert",
    helpText: "Calculate future value (Excel FV function). FV(rate, nper, pmt, [pv], [type])",
    tutorials: [
      new TutorialCommand({command: "fv(0.05, 10, -1000)", description: "Future value of $1k/year at 5% for 10 years"}),
      new TutorialCommand({command: "fv(0.06/12, 360, -2000, -200000)", description: "Future value of mortgage payments (using expression 0.06/12)"})
    ],
    extension: extensionRoot
  });

  fv.execute = function(payload) {
    const params = this.getParsedParams(payload);

    // Parameters are already evaluated by getParsedParams for 'expression' type
    const rate = params[0] || 0.05;
    const nper = params[1] || 120;
    const pmt = params[2] || -500;
    const pv = params[3] || 0;
    const type = params[4] || 0;
    const showAnalysis = params[5];

    if (nper <= 0) {
      return new ReturnObject({status: "error", message: "Number of periods must be greater than 0."});
    }

    // Excel FV formula: FV = -PV * (1 + rate)^nper - PMT * (((1 + rate)^nper - 1) / rate) * (1 + rate * type)
    let futureValue;
    if (rate === 0) {
      futureValue = -pv - (pmt * nper);
    } else {
      const pvFactor = Math.pow(1 + rate, nper);
      const pmtFactor = ((pvFactor - 1) / rate) * (1 + rate * type);
      futureValue = -pv * pvFactor - pmt * pmtFactor;
    }

    // If showAnalysis is false, just return the FV number
    if (!showAnalysis) {
      return new ReturnObject({status: "success", message: "FV calculated", payload: Calc.formatDollar(futureValue)});
    }

    let output = `# Future Value (Excel FV)\n\n`;
    output += `## Inputs\n`;
    output += `- **Rate per period**: ${(rate * 100).toFixed(4)}%\n`;
    output += `- **Number of periods**: ${nper}\n`;
    output += `- **Payment per period**: ${Calc.formatDollar(pmt)}\n`;
    output += `- **Present value**: ${Calc.formatDollar(pv)}\n`;
    output += `- **Payment timing**: ${type === 1 ? 'Beginning of period' : 'End of period'}\n\n`;

    output += `## Result\n`;
    output += `- **Future Value**: ${Calc.formatDollar(futureValue)}\n\n`;

    output += `### What This Means:\n`;
    if (pmt !== 0 && pv !== 0) {
      output += `Starting with ${Calc.formatDollar(Math.abs(pv))} and making payments of ${Calc.formatDollar(Math.abs(pmt))} `;
      output += `for ${nper} periods at ${(rate * 100).toFixed(2)}% per period, `;
      output += `the future value will be ${Calc.formatDollar(futureValue)}.\n`;
    } else if (pmt !== 0) {
      output += `Making payments of ${Calc.formatDollar(Math.abs(pmt))} for ${nper} periods `;
      output += `at ${(rate * 100).toFixed(2)}% per period will grow to ${Calc.formatDollar(futureValue)}.\n`;
    } else {
      output += `${Calc.formatDollar(Math.abs(pv))} invested at ${(rate * 100).toFixed(2)}% per period `;
      output += `for ${nper} periods will grow to ${Calc.formatDollar(futureValue)}.\n`;
    }

    return new ReturnObject({status: "success", message: "FV calculated", payload: output});
  };

  // --- Command: pmt (Excel-compatible Payment) ---
  const pmt = new Command({
    name: "pmt",
    parameters: [
      new Parameter({type: "expression", name: "rate", helpText: "Interest rate per period (e.g., 0.05 or 0.05/12)", default: 0.05, required: true}),
      new Parameter({type: "expression", name: "nper", helpText: "Total number of payment periods (e.g., 360 or 30*12)", default: 360, required: true}),
      new Parameter({type: "expression", name: "pv", helpText: "Present value (loan amount)", default: 300000, required: true}),
      new Parameter({type: "expression", name: "fv", helpText: "Future value (default 0)", default: 0, required: false}),
      new Parameter({type: "expression", name: "type", helpText: "0=end of period, 1=beginning (default 0)", default: 0, required: false})
    ],
    type: "insert",
    helpText: "Calculate payment per period (Excel PMT function). PMT(rate, nper, pv, [fv], [type])",
    tutorials: [
      new TutorialCommand({command: "pmt(0.05/12, 360, 300000)", description: "Monthly payment on $300k mortgage at 5% (using expression 0.05/12)"}),
      new TutorialCommand({command: "pmt(0.06/12, 60, 25000)", description: "Monthly payment on $25k car loan at 6%"})
    ],
    extension: extensionRoot
  });

  pmt.execute = function(payload) {
    const params = this.getParsedParams(payload);

    // Parameters are already evaluated by getParsedParams for 'expression' type
    const rate = params[0] || 0;
    const nper = params[1] || 0;
    const pv = params[2] || 0;
    const fv = params[3] || 0;
    const type = params[4] || 0;

    if (nper <= 0) {
      return new ReturnObject({status: "error", message: "Number of periods must be greater than 0."});
    }

    // Excel PMT formula
    let payment;
    if (rate === 0) {
      payment = -(pv + fv) / nper;
    } else {
      const pvFactor = Math.pow(1 + rate, nper);
      payment = -(pv * pvFactor + fv) / (((pvFactor - 1) / rate) * (1 + rate * type));
    }

    let output = `# Payment Calculation (Excel PMT)\n\n`;
    output += `## Inputs\n`;
    output += `- **Rate per period**: ${(rate * 100).toFixed(4)}%\n`;
    output += `- **Number of periods**: ${nper}\n`;
    output += `- **Present value**: ${Calc.formatDollar(pv)}\n`;
    output += `- **Future value**: ${Calc.formatDollar(fv)}\n`;
    output += `- **Payment timing**: ${type === 1 ? 'Beginning of period' : 'End of period'}\n\n`;

    output += `## Result\n`;
    output += `- **Payment per period**: ${Calc.formatDollar(payment)}\n`;
    output += `- **Total paid over life**: ${Calc.formatDollar(payment * nper)}\n`;
    output += `- **Total interest**: ${Calc.formatDollar((payment * nper) - pv)}\n\n`;

    output += `### What This Means:\n`;
    output += `To pay off a ${Calc.formatDollar(Math.abs(pv))} loan at ${(rate * 100).toFixed(2)}% per period `;
    output += `over ${nper} periods, you'll need to pay ${Calc.formatDollar(Math.abs(payment))} per period. `;
    output += `Over the life of the loan, you'll pay ${Calc.formatDollar(Math.abs(payment * nper))} total, `;
    output += `which includes ${Calc.formatDollar(Math.abs((payment * nper) - pv))} in interest.\n`;

    return new ReturnObject({status: "success", message: "PMT calculated", payload: output});
  };

  // --- Command: npv (Excel-compatible Net Present Value) ---
  const npv = new Command({
    name: "npv",
    parameters: [
      new Parameter({type: "expression", name: "rate", helpText: "Discount rate per period (e.g., 0.1 for 10%)", default: 0.1, required: true})
    ],
    type: "replaceLine",
    helpText: "Calculate net present value (Excel NPV function) from comma-separated cash flows on current line. NPV(rate) on line: value1, value2, ...",
    tutorials: [
      new TutorialCommand({command: "npv(0.1)", description: "On line: -10000, 3000, 4200, 6800"}),
      new TutorialCommand({command: "npv(0.08)", description: "Calculate NPV at 8% discount rate"})
    ],
    extension: extensionRoot
  });

  npv.execute = function(payload) {
    const params = this.getParsedParams(payload);

    // Parameters are already evaluated by getParsedParams for 'expression' type
    const rate = params[0] || 0;

    const text = payload.fullText.trim();
    const cashFlows = text.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

    if (cashFlows.length < 1) {
      return new ReturnObject({status: "error", message: "Requires values to be on the same line. Format: value1, value2, ..."});
    }

    // Excel NPV formula: Sum of (cashFlow / (1 + rate)^period) for period 1 to n
    let npvValue = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      npvValue += cashFlows[i] / Math.pow(1 + rate, i + 1);
    }

    let output = `# Net Present Value (Excel NPV)\n\n`;
    output += `## Inputs\n`;
    output += `- **Discount rate**: ${(rate * 100).toFixed(2)}%\n`;
    output += `- **Cash flows**: ${cashFlows.map(cf => Calc.formatDollar(cf)).join(', ')}\n`;
    output += `- **Number of periods**: ${cashFlows.length}\n\n`;

    output += `## Result\n`;
    output += `- **Net Present Value**: ${Calc.formatDollar(npvValue)}\n\n`;

    output += `## Period-by-Period Breakdown\n`;
    for (let i = 0; i < cashFlows.length; i++) {
      const pv = cashFlows[i] / Math.pow(1 + rate, i + 1);
      output += `- Period ${i + 1}: ${Calc.formatDollar(cashFlows[i])} → PV: ${Calc.formatDollar(pv)}\n`;
    }
    output += `\n`;

    output += `### What This Means:\n`;
    if (npvValue > 0) {
      output += `✅ **Positive NPV (${Calc.formatDollar(npvValue)})** - This investment is projected to create value. `;
      output += `The present value of future cash flows exceeds the cost, making it a potentially good investment.\n`;
    } else if (npvValue < 0) {
      output += `❌ **Negative NPV (${Calc.formatDollar(npvValue)})** - This investment is projected to destroy value. `;
      output += `The present value of future cash flows is less than the cost.\n`;
    } else {
      output += `The investment breaks even - the present value of future cash flows equals the cost.\n`;
    }

    output += `\nNPV accounts for the time value of money, discounting future cash flows at ${(rate * 100).toFixed(2)}% per period. `;
    output += `This helps you compare investments with different timing and amounts.\n`;

    return new ReturnObject({status: "success", message: "NPV calculated", payload: output});
  };

  // --- Command: irr (Excel-compatible Internal Rate of Return) ---
  const irr = new Command({
    name: "irr",
    parameters: [],
    type: "replaceLine",
    helpText: "Calculate internal rate of return (Excel IRR function) from comma-separated cash flows. Place on line with: value1, value2, ...",
    tutorials: [
      new TutorialCommand({command: "irr", description: "On line: -10000, 3000, 4200, 6800 (calculates IRR)"}),
      new TutorialCommand({command: "irr", description: "Returns the discount rate that makes NPV = 0"})
    ],
    extension: extensionRoot
  });

  irr.execute = function(payload) {
    const text = payload.fullText.trim();
    const cashFlows = text.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

    if (cashFlows.length < 2) {
      return new ReturnObject({status: "error", message: "Requires values to be on the same line (at least 2). Format: value1, value2, ..."});
    }

    // Check if there's at least one positive and one negative cash flow
    const hasPositive = cashFlows.some(cf => cf > 0);
    const hasNegative = cashFlows.some(cf => cf < 0);
    if (!hasPositive || !hasNegative) {
      return new ReturnObject({status: "error", message: "Cash flows must include both positive and negative values."});
    }

    // Newton-Raphson method to find IRR
    const calculateNPV = (rate, flows) => {
      let npv = 0;
      for (let i = 0; i < flows.length; i++) {
        npv += flows[i] / Math.pow(1 + rate, i);
      }
      return npv;
    };

    const calculateNPVDerivative = (rate, flows) => {
      let derivative = 0;
      for (let i = 1; i < flows.length; i++) {
        derivative -= i * flows[i] / Math.pow(1 + rate, i + 1);
      }
      return derivative;
    };

    let rate = 0.1; // Initial guess
    let iteration = 0;
    const maxIterations = 100;
    const tolerance = 0.000001;

    while (iteration < maxIterations) {
      const npv = calculateNPV(rate, cashFlows);
      if (Math.abs(npv) < tolerance) break;

      const derivative = calculateNPVDerivative(rate, cashFlows);
      if (derivative === 0) {
        return new ReturnObject({status: "error", message: "Cannot calculate IRR - derivative is zero."});
      }

      rate = rate - npv / derivative;
      iteration++;
    }

    if (iteration >= maxIterations) {
      return new ReturnObject({status: "error", message: "IRR calculation did not converge. Cash flows may not have a valid IRR."});
    }

    let output = `# Internal Rate of Return (Excel IRR)\n\n`;
    output += `## Cash Flows\n`;
    for (let i = 0; i < cashFlows.length; i++) {
      output += `- Period ${i}: ${Calc.formatDollar(cashFlows[i])}\n`;
    }
    output += `\n`;

    output += `## Result\n`;
    output += `- **IRR**: ${(rate * 100).toFixed(4)}%\n`;
    output += `- **Converged in**: ${iteration} iterations\n`;
    output += `- **NPV at IRR**: ${Calc.formatDollar(calculateNPV(rate, cashFlows))} (should be ≈ $0)\n\n`;

    output += `### What This Means:\n`;
    output += `The Internal Rate of Return (IRR) is ${(rate * 100).toFixed(2)}%. `;
    output += `This is the discount rate that makes the Net Present Value of all cash flows equal to zero. `;
    output += `In other words, it's the "break-even" return rate for this investment.\n\n`;

    if (rate > 0) {
      output += `✅ An IRR of ${(rate * 100).toFixed(2)}% means this investment generates that annual return. `;
      output += `Compare this to your required rate of return:\n`;
      output += `- If your required return is **less than** ${(rate * 100).toFixed(2)}%, this is a **good** investment\n`;
      output += `- If your required return is **more than** ${(rate * 100).toFixed(2)}%, **reject** this investment\n`;
    } else {
      output += `❌ Negative IRR (${(rate * 100).toFixed(2)}%) means this investment loses money over time.\n`;
    }

    return new ReturnObject({status: "success", message: "IRR calculated", payload: output});
  };
})();
