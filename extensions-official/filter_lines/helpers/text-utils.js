// ===============================
// filter_lines: Text Utilities
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["filter_lines"];

  ctx.shared.TextUtils = {
    /**
     * Find the Nth occurrence of a substring in a string
     * @param {string} str - The string to search in
     * @param {string} search - The substring to find
     * @param {number} n - Which occurrence to find (1-indexed)
     * @param {boolean} caseSensitive - Whether to match case
     * @returns {number} - The index of the Nth occurrence, or -1 if not found
     */
    findNthOccurrence: function(str, search, n, caseSensitive) {
      if (!caseSensitive) {
        str = str.toLowerCase();
        search = search.toLowerCase();
      }

      let count = 0;
      let pos = 0;

      while (pos < str.length) {
        const index = str.indexOf(search, pos);
        if (index === -1) return -1;

        count++;
        if (count === n) return index;

        pos = index + 1;
      }

      return -1;
    },

    /**
     * Find the last occurrence of a substring in a string
     * @param {string} str - The string to search in
     * @param {string} search - The substring to find
     * @param {boolean} caseSensitive - Whether to match case
     * @returns {number} - The index of the last occurrence, or -1 if not found
     */
    findLastOccurrence: function(str, search, caseSensitive) {
      if (!caseSensitive) {
        str = str.toLowerCase();
        search = search.toLowerCase();
      }

      return str.lastIndexOf(search);
    },

    /**
     * Check if a string contains a substring (case-sensitive or not)
     * @param {string} str - The string to search in
     * @param {string} search - The substring to find
     * @param {boolean} caseSensitive - Whether to match case
     * @returns {boolean} - True if found
     */
    contains: function(str, search, caseSensitive) {
      if (!caseSensitive) {
        return str.toLowerCase().includes(search.toLowerCase());
      }
      return str.includes(search);
    }
  };
})();
