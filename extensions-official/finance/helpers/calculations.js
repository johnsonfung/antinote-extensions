// ===============================
// finance: Financial Calculation Helpers
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["finance"];

  // Calculate Present Value
  const calculatePV = (futureValue, years, rate) => {
    return futureValue / Math.pow(1 + rate, years);
  };

  // Calculate Future Value
  const calculateFV = (presentValue, years, rate) => {
    return presentValue * Math.pow(1 + rate, years);
  };

  // Calculate payment for a loan (PMT formula)
  const calculatePMT = (principal, ratePerPeriod, numberOfPeriods) => {
    if (ratePerPeriod === 0) {
      return principal / numberOfPeriods;
    }
    return (principal * ratePerPeriod * Math.pow(1 + ratePerPeriod, numberOfPeriods)) /
           (Math.pow(1 + ratePerPeriod, numberOfPeriods) - 1);
  };

  // Generate amortization schedule
  const generateAmortization = (principal, ratePerPeriod, numberOfPeriods, payment) => {
    const schedule = [];
    let balance = principal;

    for (let period = 1; period <= numberOfPeriods; period++) {
      const interestPayment = balance * ratePerPeriod;
      const principalPayment = payment - interestPayment;
      balance = balance - principalPayment;

      // Handle floating point precision issues
      if (balance < 0.01) balance = 0;

      schedule.push({
        period,
        payment: payment,
        principal: principalPayment,
        interest: interestPayment,
        balance: balance
      });
    }

    return schedule;
  };

  // Convert amortization schedule to CSV
  const amortizationToCSV = (schedule) => {
    let csv = "Period,Payment,Principal,Interest,Balance\n";
    for (const row of schedule) {
      csv += `${row.period},${formatMoney(row.payment)},${formatMoney(row.principal)},${formatMoney(row.interest)},${formatMoney(row.balance)}\n`;
    }
    return csv;
  };

  // Format number as money
  const formatMoney = (amount) => {
    return amount.toFixed(2);
  };

  // Format number as money with dollar sign
  const formatDollar = (amount) => {
    return "$" + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Format percentage
  const formatPercent = (rate) => {
    return (rate * 100).toFixed(2) + "%";
  };

  // Convert annual rate to periodic rate
  const getPeriodicRate = (annualRate, periodsPerYear) => {
    return annualRate / periodsPerYear;
  };

  // Calculate compound interest with contributions
  const calculateInvestmentGrowth = (initial, annualContribution, monthlyContribution, annualRate, years) => {
    let balance = initial;
    const monthlyRate = annualRate / 12;
    const totalMonths = years * 12;

    for (let month = 1; month <= totalMonths; month++) {
      // Add monthly contribution
      balance += monthlyContribution;

      // Add annual contribution at start of each year
      if (month % 12 === 1 && month > 1) {
        balance += annualContribution;
      }

      // Apply monthly interest
      balance = balance * (1 + monthlyRate);
    }

    return balance;
  };

  // Calculate total contributions
  const calculateTotalContributions = (initial, annualContribution, monthlyContribution, years) => {
    const totalAnnual = annualContribution * years;
    const totalMonthly = monthlyContribution * 12 * years;
    return initial + totalAnnual + totalMonthly;
  };

  // Export helpers to shared namespace
  ctx.shared.Calculations = {
    calculatePV,
    calculateFV,
    calculatePMT,
    generateAmortization,
    amortizationToCSV,
    formatMoney,
    formatDollar,
    formatPercent,
    getPeriodicRate,
    calculateInvestmentGrowth,
    calculateTotalContributions
  };
})();
