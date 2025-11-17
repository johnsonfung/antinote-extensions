// ===============================
// list_tools: List Parser Utilities
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["list_tools"];

  ctx.shared.Parser = {
    /**
     * Parse a comma-separated list, respecting quotes
     * @param {string} text - The text to parse
     * @param {boolean} trimWhitespace - Whether to trim whitespace from items
     * @param {string|null} quoteChar - The quote character to respect, or null for all quotes
     * @returns {Array<string>} - Array of parsed items
     */
    parseCommaList: function(text, trimWhitespace, quoteChar) {
      const items = [];
      let current = '';
      let inQuotes = false;
      let quoteType = null;
      const validQuotes = quoteChar ? [quoteChar] : ['"', "'", '`'];

      for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (validQuotes.includes(char)) {
          if (!inQuotes) {
            inQuotes = true;
            quoteType = char;
            current += char;
          } else if (char === quoteType) {
            inQuotes = false;
            quoteType = null;
            current += char;
          } else {
            current += char;
          }
        } else if (char === ',' && !inQuotes) {
          const item = trimWhitespace ? current.trim() : current;
          items.push(item);
          current = '';
        } else {
          current += char;
        }
      }

      // Add the last item
      if (current.length > 0 || text.endsWith(',')) {
        const item = trimWhitespace ? current.trim() : current;
        items.push(item);
      }

      return items;
    }
  };
})();
