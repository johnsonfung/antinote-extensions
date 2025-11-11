// Forecast Command

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["business"];
  const extensionRoot = ctx.root;
  const Stats = ctx.shared.Statistics;

  // --- Command: forecast ---
  const forecast = new Command({
  name: "forecast",
  parameters: [
    new Parameter({type: "number", name: "periods", helpText: "Number of future periods to forecast", default: 3})
  ],
  type: "insert",
  helpText: "Forecast future values based on historical numbers. Uses linear regression and variance analysis.",
  tutorials: [
    new TutorialCommand({command: "forecast(3)", description: "Forecast next 3 periods from numbers in note"}),
    new TutorialCommand({command: "forecast(6)", description: "Forecast next 6 periods with confidence intervals"})
  ],
  extension: extensionRoot
});

forecast.execute = function(payload) {
  const params = this.getParsedParams(payload);
  const periodsToForecast = parseInt(params[0]) || 3;
  const fullText = payload.fullText || "";

  if (!fullText.trim()) {
    return new ReturnObject({
      status: "error",
      message: "No text found in note. Please add historical numbers to analyze."
    });
  }

  // Extract all numbers from the text
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
      message: `Found ${numbers.length} number(s). Need at least 2 historical values to forecast.`
    });
  }

  // Calculate linear regression
  const regression = Stats.linearRegression(numbers);
  const slope = regression.slope;
  const intercept = regression.intercept;

  // Calculate historical fit and residuals
  const residuals = [];
  for (let i = 0; i < numbers.length; i++) {
    const predicted = slope * i + intercept;
    residuals.push(numbers[i] - predicted);
  }

  const stdError = Stats.standardDeviation(residuals);
  const avgChange = Stats.mean(numbers.slice(1).map((val, i) => val - numbers[i]));
  const avgPercentChange = Stats.mean(numbers.slice(1).map((val, i) => (val - numbers[i]) / Math.abs(numbers[i])));

  // Generate forecasts
  let output = `# Forecast Analysis\n\n`;
  output += `## Historical Data\n\n`;
  output += `**Data Points**: ${numbers.length}\n`;
  output += `**Range**: ${Stats.formatNumber(Math.min(...numbers), 2)} to ${Stats.formatNumber(Math.max(...numbers), 2)}\n`;
  output += `**Average Change**: ${Stats.formatNumber(avgChange, 2)} per period (${Stats.formatPercent(avgPercentChange, 2)})\n`;
  output += `**Trend**: ${slope > 0 ? '📈 Upward' : slope < 0 ? '📉 Downward' : '➡️ Flat'}\n\n`;

  output += `## Forecast (Next ${periodsToForecast} Periods)\n\n`;
  output += `| Period | Point Forecast | Lower Bound (90%) | Upper Bound (90%) |\n`;
  output += `|--------|---------------|-------------------|-------------------|\n`;

  const forecasts = [];
  const zScore = 1.645; // 90% confidence interval

  for (let i = 0; i < periodsToForecast; i++) {
    const periodIndex = numbers.length + i;
    const pointForecast = slope * periodIndex + intercept;

    // Confidence interval widens with distance from data
    const distanceFactor = Math.sqrt(1 + i);
    const marginOfError = zScore * stdError * distanceFactor;

    const lowerBound = pointForecast - marginOfError;
    const upperBound = pointForecast + marginOfError;

    forecasts.push({
      period: periodIndex + 1,
      point: pointForecast,
      lower: lowerBound,
      upper: upperBound
    });

    output += `| ${periodIndex + 1} | ${Stats.formatNumber(pointForecast, 2)} | ${Stats.formatNumber(lowerBound, 2)} | ${Stats.formatNumber(upperBound, 2)} |\n`;
  }

  output += `\n## Forecast Method\n\n`;
  output += `**Regression Equation**: y = ${Stats.formatNumber(slope, 4)}x + ${Stats.formatNumber(intercept, 2)}\n\n`;
  output += `This forecast uses **linear regression** to identify the underlying trend in your historical data. `;
  output += `The point forecast represents the most likely value, while the confidence intervals show the range where we expect the actual value to fall 90% of the time.\n\n`;

  output += `## Understanding the Forecast\n\n`;
  output += `**Point Forecast**: The single most likely value based on the historical trend.\n\n`;
  output += `**Confidence Intervals**: The range of likely outcomes. `;
  output += `There's a 90% probability the actual value will fall within this range. `;
  output += `Notice the intervals get wider further into the future—this reflects increasing uncertainty.\n\n`;

  if (stdError / Stats.mean(numbers) > 0.2) {
    output += `**⚠️ High Variability**: Your historical data shows significant variation (${Stats.formatPercent(stdError / Stats.mean(numbers), 1)} coefficient of variation). `;
    output += `This means forecasts are less reliable. Consider:\n`;
    output += `- Are there seasonal patterns not captured by this model?\n`;
    output += `- Are there external factors affecting the trend?\n`;
    output += `- Is a linear trend appropriate for your data?\n\n`;
  }

  if (slope > 0) {
    output += `**📈 Upward Trend**: Your data shows growth of approximately ${Stats.formatNumber(slope, 2)} per period. `;
    output += `If this trend continues, you'll reach ${Stats.formatNumber(forecasts[forecasts.length - 1].point, 2)} by period ${forecasts[forecasts.length - 1].period}.\n\n`;
  } else if (slope < 0) {
    output += `**📉 Downward Trend**: Your data shows a decline of approximately ${Stats.formatNumber(Math.abs(slope), 2)} per period. `;
    output += `If this trend continues, you'll reach ${Stats.formatNumber(forecasts[forecasts.length - 1].point, 2)} by period ${forecasts[forecasts.length - 1].period}.\n\n`;
  } else {
    output += `**➡️ Flat Trend**: Your data shows little to no clear trend. Forecasts will be close to recent average values.\n\n`;
  }

  output += `## Important Limitations\n\n`;
  output += `- **Linear assumption**: This forecast assumes the trend will continue linearly. Real-world data often has cycles, seasonality, or regime changes.\n`;
  output += `- **Past ≠ Future**: Historical patterns may not continue. External factors, market changes, or business decisions can alter trends.\n`;
  output += `- **Short-term focus**: Forecasts become less reliable further into the future. Use near-term forecasts with higher confidence.\n`;
  output += `- **Statistical only**: This model doesn't incorporate business knowledge, market intelligence, or planned changes.\n\n`;

  output += `**Best Practice**: Use this as one input alongside business judgment, market research, and domain expertise.`;

  return new ReturnObject({
    status: "success",
    message: "Forecast analysis completed",
    payload: output
  });
};
})();
