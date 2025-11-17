// ===============================
// regex: Regex Parser Utilities
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["regex"];

  ctx.shared.RegexParser = {
    /**
     * Parse a regex expression, handling both /pattern/flags and plain string formats
     * @param {string} expression - The regex expression
     * @param {string} defaultFlags - Default flags to use if none specified
     * @returns {RegExp} - The parsed regex object
     */
    parseRegex: function(expression, defaultFlags) {
      defaultFlags = defaultFlags || 'gi';

      // Check if expression is in /pattern/flags format
      const match = expression.match(/^\/(.*)\/([gimsuvy]*)$/);

      if (match) {
        // Extract pattern and flags from /pattern/flags format
        const pattern = match[1];
        const flags = match[2] || defaultFlags;
        try {
          return new RegExp(pattern, flags);
        } catch (e) {
          throw new Error(`Invalid regex pattern: ${e.message}`);
        }
      } else {
        // Plain string - treat as pattern with default flags
        try {
          return new RegExp(expression, defaultFlags);
        } catch (e) {
          throw new Error(`Invalid regex pattern: ${e.message}`);
        }
      }
    }
  };
})();
