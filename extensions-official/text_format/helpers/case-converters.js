// ===============================
// text_format: Case Conversion Helpers
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["text_format"];

  const sentenceCase = (text) => {
    // Capitalize first letter, lowercase the rest
    if (!text || text.length === 0) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const titleCase = (text) => {
    // Capitalize first letter of each word
    const smallWords = ["a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on", "or", "so", "the", "to", "up", "yet"];
    const words = text.toLowerCase().split(" ");

    for (let i = 0; i < words.length; i++) {
      // Always capitalize first and last word, or if not a small word
      if (i === 0 || i === words.length - 1 || !smallWords.includes(words[i])) {
        if (words[i].length > 0) {
          words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
        }
      }
    }

    return words.join(" ");
  };

  const removeQuotes = (text) => {
    let result = text;
    let changed = true;
    let iteration = 0;

    // Keep removing pairs until no more found
    while (changed && iteration < 100) {
      changed = false;
      iteration++;

      // Find all valid quote positions (not apostrophes between letters/numbers)
      const quoteChars = ['"', "'", "\u201C", "\u201D", "\u2018", "\u2019"];
      const validQuotes = [];

      for (let i = 0; i < result.length; i++) {
        if (quoteChars.includes(result[i])) {
          // Check if between alphanumerics (apostrophe case)
          const before = i > 0 ? result[i - 1] : '';
          const after = i < result.length - 1 ? result[i + 1] : '';
          const isAlphanumBefore = /[a-zA-Z0-9]/.test(before);
          const isAlphanumAfter = /[a-zA-Z0-9]/.test(after);

          // Only valid if NOT between two alphanumerics
          if (!(isAlphanumBefore && isAlphanumAfter)) {
            validQuotes.push({ pos: i, char: result[i] });
          }
        }
      }

      // Find first pair
      if (validQuotes.length >= 2) {
        const firstQuote = validQuotes[0];
        let matchingQuote = null;

        // Find next matching quote of same type (handle smart quotes pairing)
        for (let j = 1; j < validQuotes.length; j++) {
          const currentChar = validQuotes[j].char;
          const firstChar = firstQuote.char;

          // Check if same type (handle straight quotes and smart quote pairs)
          const isMatch = currentChar === firstChar ||
            (firstChar === "\u201C" && currentChar === "\u201D") ||
            (firstChar === "\u201D" && currentChar === "\u201C") ||
            (firstChar === "\u2018" && currentChar === "\u2019");

          if (isMatch) {
            matchingQuote = validQuotes[j];
            break;
          }
        }

        if (matchingQuote) {
          // Remove both quotes
          result = result.substring(0, firstQuote.pos) +
            result.substring(firstQuote.pos + 1, matchingQuote.pos) +
            result.substring(matchingQuote.pos + 1);
          changed = true;
        }
      }
    }

    return result;
  };

  // Export helpers to shared namespace
  ctx.shared.CaseConverters = {
    sentenceCase,
    titleCase,
    removeQuotes
  };
})();
