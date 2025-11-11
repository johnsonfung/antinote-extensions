// Growth Analysis Command

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["business"];
  const extensionRoot = ctx.root;
  const Stats = ctx.shared.Statistics;

  // --- Command: growth ---
  const growth = new Command({
  name: "growth",
  parameters: [],
  type: "insert",
  helpText: "Analyze percentage growth between consecutive numbers in the note. Numbers can be comma-separated, space-separated, or line-separated.",
  tutorials: [
    new TutorialCommand({command: "growth", description: "On note with numbers: 10, 30, 80"}),
    new TutorialCommand({command: "growth", description: "Calculates growth rate between each consecutive pair"})
  ],
  extension: extensionRoot
});

growth.execute = function(payload) {
  const fullText = payload.fullText || "";

  if (!fullText.trim()) {
    return new ReturnObject({
      status: "error",
      message: "No text found in note. Please add numbers to analyze."
    });
  }

  // Extract all numbers from the text (handles comma, space, and line separation)
  const numbers = [];
  const matches = fullText.match(/-?\d+\.?\d*/g);

  if (matches) {
    matches.forEach(match => {
      const num = parseFloat(match);
      if (!isNaN(num)) {
        numbers.push(num);
      }
    });
  }

  if (numbers.length < 2) {
    return new ReturnObject({
      status: "error",
      message: `Found ${numbers.length} number(s). Need at least 2 numbers to calculate growth.`
    });
  }

  // Calculate growth between consecutive pairs
  const growthRates = [];
  let output = `# Growth Analysis\n\n`;
  output += `**Numbers analyzed**: ${numbers.length}\n\n`;
  output += `## Growth Between Consecutive Values\n\n`;

  for (let i = 0; i < numbers.length - 1; i++) {
    const current = numbers[i];
    const next = numbers[i + 1];
    const change = Stats.percentageChange(current, next);
    growthRates.push(change);

    const changeFormatted = Stats.formatPercent(change, 2);
    const absoluteChange = next - current;

    output += `${Stats.formatNumber(current, 2)} → ${Stats.formatNumber(next, 2)} is **${changeFormatted}**`;

    if (absoluteChange >= 0) {
      output += ` ⬆️ (+${Stats.formatNumber(absoluteChange, 2)})`;
    } else {
      output += ` ⬇️ (${Stats.formatNumber(absoluteChange, 2)})`;
    }

    output += `\n`;
  }

  // Calculate average growth
  const avgGrowth = Stats.mean(growthRates);
  const stdDev = Stats.standardDeviation(growthRates);

  output += `\n## Summary Statistics\n\n`;
  output += `- **Average Growth Rate**: ${Stats.formatPercent(avgGrowth, 2)}\n`;
  output += `- **Standard Deviation**: ${Stats.formatPercent(stdDev, 2)}\n`;

  // Find min and max growth
  const minGrowth = Math.min(...growthRates);
  const maxGrowth = Math.max(...growthRates);
  output += `- **Minimum Growth**: ${Stats.formatPercent(minGrowth, 2)}\n`;
  output += `- **Maximum Growth**: ${Stats.formatPercent(maxGrowth, 2)}\n`;

  // Calculate CAGR (Compound Annual Growth Rate equivalent)
  const totalPeriods = numbers.length - 1;
  const startValue = numbers[0];
  const endValue = numbers[numbers.length - 1];
  const cagr = Math.pow(endValue / startValue, 1 / totalPeriods) - 1;

  output += `- **Compound Growth Rate** (CAGR equivalent): ${Stats.formatPercent(cagr, 2)}\n`;

  output += `\n## What This Means\n\n`;
  output += `The **average growth rate** of ${Stats.formatPercent(avgGrowth, 2)} represents the mean percentage change between consecutive values. `;

  if (stdDev > 0.5) {
    output += `However, with a standard deviation of ${Stats.formatPercent(stdDev, 2)}, your growth is **highly variable**—some periods show rapid growth while others may decline.\n\n`;
  } else if (stdDev > 0.2) {
    output += `The standard deviation of ${Stats.formatPercent(stdDev, 2)} shows **moderate variability** in your growth rates.\n\n`;
  } else {
    output += `The low standard deviation of ${Stats.formatPercent(stdDev, 2)} indicates **consistent, stable growth** across periods.\n\n`;
  }

  output += `The **compound growth rate** (${Stats.formatPercent(cagr, 2)}) shows the equivalent consistent rate that would take you from ${Stats.formatNumber(startValue, 2)} to ${Stats.formatNumber(endValue, 2)} over ${totalPeriods} period(s). `;

  if (Math.abs(cagr - avgGrowth) > 0.05) {
    output += `This differs from your average growth rate, suggesting non-linear growth patterns.\n`;
  } else {
    output += `This is close to your average growth rate, suggesting relatively consistent growth.\n`;
  }

  return new ReturnObject({
    status: "success",
    message: "Growth analysis completed",
    payload: output
  });
};
})();
