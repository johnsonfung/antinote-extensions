// ===============================
// Antinote Extension: line_format
// Version 1.0.0
// ===============================

(function () {
  const extensionName = "line_format";

  const extensionRoot = new Extension(
    extensionName,
    "1.0.0",
    [],
    [],
    "johnsonfung",
    "Text Formatting",
    "line"  // Only needs current line access
  );

  // --- Helper Functions ---

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

  const toCamelCase = (text) => {
    // Remove special characters and convert to camelCase
    return text
      .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
      .replace(/^[A-Z]/, (match) => match.toLowerCase());
  };

  const toSnakeCase = (text) => {
    // Convert to snake_case
    return text
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`)
      .replace(/^_+|_+$/g, "")
      .toLowerCase();
  };

  const toKebabCase = (text) => {
    // Convert to kebab-case
    return text
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`)
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
  };

  const removeQuotes = (text) => {
    console.log("removeQuotes INPUT:", JSON.stringify(text));
    let result = text;
    let changed = true;
    let iteration = 0;

    // Keep removing pairs until no more found
    while (changed && iteration < 100) {
      changed = false;
      iteration++;
      console.log(`Iteration ${iteration}:`, JSON.stringify(result));

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

      console.log("Valid quotes found:", validQuotes.length);

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
          console.log("Removing pair at positions", firstQuote.pos, "and", matchingQuote.pos);
          // Remove both quotes
          result = result.substring(0, firstQuote.pos) +
            result.substring(firstQuote.pos + 1, matchingQuote.pos) +
            result.substring(matchingQuote.pos + 1);
          changed = true;
        }
      }
    }

    console.log("removeQuotes OUTPUT:", JSON.stringify(result));
    return result;
  };

  // --- Command: uppercase_line ---
  const uppercase_line = new Command(
    "uppercase_line",
    [],
    "replaceLine",
    "Convert the current line to uppercase.",
    [
      new TutorialCommand("uppercase_line", "Make current line uppercase")
    ],
    extensionRoot
  );

  uppercase_line.execute = function (payload) {
    const result = payload.fullText.toUpperCase();
    return new ReturnObject("success", "Line converted to uppercase.", result);
  };

  // --- Command: lowercase_line ---
  const lowercase_line = new Command(
    "lowercase_line",
    [],
    "replaceLine",
    "Convert the current line to lowercase.",
    [
      new TutorialCommand("lowercase_line", "Make current line lowercase")
    ],
    extensionRoot
  );

  lowercase_line.execute = function (payload) {
    const result = payload.fullText.toLowerCase();
    return new ReturnObject("success", "Line converted to lowercase.", result);
  };

  // --- Command: sentence_case_line ---
  const sentence_case_line = new Command(
    "sentence_case_line",
    [],
    "replaceLine",
    "Convert the current line to sentence case (first letter capitalized).",
    [
      new TutorialCommand("sentence_case_line", "Convert current line to sentence case")
    ],
    extensionRoot
  );

  sentence_case_line.execute = function (payload) {
    const result = sentenceCase(payload.fullText);
    return new ReturnObject("success", "Line converted to sentence case.", result);
  };

  // --- Command: title_case_line ---
  const title_case_line = new Command(
    "title_case_line",
    [],
    "replaceLine",
    "Convert the current line to title case.",
    [
      new TutorialCommand("title_case_line", "Convert current line to title case")
    ],
    extensionRoot
  );

  title_case_line.execute = function (payload) {
    const result = titleCase(payload.fullText);
    return new ReturnObject("success", "Line converted to title case.", result);
  };

  // --- Command: camel_case ---
  const camel_case = new Command(
    "camel_case",
    [],
    "replaceLine",
    "Convert the current line to camelCase.",
    [
      new TutorialCommand("camel_case", "Convert line to camelCase")
    ],
    extensionRoot
  );

  camel_case.execute = function (payload) {
    const result = toCamelCase(payload.fullText);
    return new ReturnObject("success", "Line converted to camelCase.", result);
  };

  // --- Command: snake_case ---
  const snake_case = new Command(
    "snake_case",
    [],
    "replaceLine",
    "Convert the current line to snake_case.",
    [
      new TutorialCommand("snake_case", "Convert line to snake_case")
    ],
    extensionRoot
  );

  snake_case.execute = function (payload) {
    const result = toSnakeCase(payload.fullText);
    return new ReturnObject("success", "Line converted to snake_case.", result);
  };

  // --- Command: kebab_case ---
  const kebab_case = new Command(
    "kebab_case",
    [],
    "replaceLine",
    "Convert the current line to kebab-case.",
    [
      new TutorialCommand("kebab_case", "Convert line to kebab-case")
    ],
    extensionRoot
  );

  kebab_case.execute = function (payload) {
    const result = toKebabCase(payload.fullText);
    return new ReturnObject("success", "Line converted to kebab-case.", result);
  };

  // --- Command: remove_quotes_line ---
  const remove_quotes_line = new Command(
    "remove_quotes_line",
    [],
    "replaceLine",
    "Remove surrounding quotes from the current line.",
    [
      new TutorialCommand("remove_quotes_line", "Remove quotes from current line")
    ],
    extensionRoot
  );

  remove_quotes_line.execute = function (payload) {
    const result = removeQuotes(payload.fullText);
    return new ReturnObject("success", "Quotes removed from line.", result);
  };
})();
