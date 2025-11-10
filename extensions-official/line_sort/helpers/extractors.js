// ===============================
// line_sort: Number Extraction Helpers
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["line_sort"];

  const extractFirstNumber = (text) => {
    const match = text.match(/-?\d+\.?\d*/);
    return match ? parseFloat(match[0]) : null;
  };

  const extractLastNumber = (text) => {
    const matches = text.match(/-?\d+\.?\d*/g);
    return matches?.length > 0 ? parseFloat(matches[matches.length - 1]) : null;
  };

  // Export helpers to shared namespace
  ctx.shared.Extractors = {
    extractFirstNumber,
    extractLastNumber
  };
})();
