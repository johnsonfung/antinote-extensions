// Helper functions for statistical calculations

(function() {
  // Get the shared namespace
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;

  // Default separators (can be overridden by user settings)
  const defaultSeparators = {
    decimal: '.',
    thousands: ','
  };

  // Format percentage with regional settings support
  const formatPercent = (value, decimals = 2, userSettings = null) => {
    const decimalSep = userSettings?.decimalSeparator || defaultSeparators.decimal;
    const formatted = (value * 100).toFixed(decimals);
    return `${formatted.replace('.', decimalSep)}%`;
  };

  // Format number with regional settings support
  const formatNumber = (value, decimals = 2, userSettings = null) => {
    const decimalSep = userSettings?.decimalSeparator || defaultSeparators.decimal;
    const thousandsSep = userSettings?.thousandsSeparator || defaultSeparators.thousands;

    const parts = value.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
    return parts.join(decimalSep);
  };

  // Calculate percentage change between two numbers
  const percentageChange = (oldValue, newValue) => {
    if (oldValue === 0) return newValue > 0 ? Infinity : 0;
    return ((newValue - oldValue) / Math.abs(oldValue));
  };

  // Calculate mean of an array
  const mean = (values) => {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };

  // Calculate standard deviation
  const standardDeviation = (values) => {
    if (values.length === 0) return 0;
    const avg = mean(values);
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    return Math.sqrt(mean(squareDiffs));
  };

  // Calculate z-score for two proportions test
  const zScoreProportions = (p1, n1, p2, n2) => {
    const pooledProportion = ((p1 * n1) + (p2 * n2)) / (n1 + n2);
    const standardError = Math.sqrt(pooledProportion * (1 - pooledProportion) * ((1 / n1) + (1 / n2)));

    if (standardError === 0) return 0;

    return (p1 - p2) / standardError;
  };

  // Get p-value from z-score (two-tailed test)
  const getPValueFromZ = (z) => {
    // Using approximation for normal distribution CDF
    const absZ = Math.abs(z);

    // Standard normal cumulative distribution function approximation
    const t = 1 / (1 + 0.2316419 * absZ);
    const d = 0.3989423 * Math.exp(-absZ * absZ / 2);
    const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

    return 2 * probability; // Two-tailed
  };

  // Check if result is statistically significant
  const isSignificant = (pValue, confidenceLevel) => {
    const alpha = 1 - confidenceLevel;
    return pValue < alpha;
  };

  // Calculate required sample size for proportion test
  const sampleSizeForProportion = (baselineRate, minimumDetectableEffect, alpha = 0.05, power = 0.8) => {
    // Using simplified formula for equal sample sizes
    const p1 = baselineRate;
    const p2 = baselineRate + minimumDetectableEffect;
    const pAvg = (p1 + p2) / 2;

    // Z-scores for alpha and power
    const zAlpha = 1.96; // for 95% confidence (two-tailed)
    const zBeta = 0.84; // for 80% power

    const numerator = Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2));
    const denominator = Math.pow(p1 - p2, 2);

    return Math.ceil(numerator / denominator);
  };

  // Linear regression for forecasting
  const linearRegression = (values) => {
    const n = values.length;
    if (n < 2) return { slope: 0, intercept: values[0] || 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  };

  // Export to shared namespace
  if (typeof globalScope.__EXTENSION_SHARED__ !== 'undefined' &&
      typeof globalScope.__EXTENSION_SHARED__.business !== 'undefined') {
    globalScope.__EXTENSION_SHARED__.business.shared.Statistics = {
      formatPercent,
      formatNumber,
      percentageChange,
      mean,
      standardDeviation,
      zScoreProportions,
      getPValueFromZ,
      isSignificant,
      sampleSizeForProportion,
      linearRegression
    };
  }
})();
