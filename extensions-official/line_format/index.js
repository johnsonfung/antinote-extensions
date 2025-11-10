// ===============================
// Antinote Extension: line_format
// Version 1.0.0
// ===============================

(function () {
  const extensionName = "line_format";

  const extensionRoot = new Extension({
    name: extensionName,
    version: "1.0.0",
    endpoints: [],
    requiredAPIKeys: [],
    author: "johnsonfung",
    category: "Text Formatting",
    dataScope: "line"  // Only needs current line access
  });

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
  const uppercase_line = new Command({
    name: "uppercase_line",
    parameters: [],
    type: "replaceLine",
    helpText: "Convert the current line to uppercase.",
    tutorials: [
      new TutorialCommand({command: "uppercase_line", description: "Make current line uppercase"})
    ],
    extension: extensionRoot
  });

  uppercase_line.execute = function (payload) {
    const result = payload.fullText.toUpperCase();
    return new ReturnObject({status: "success", message: "Line converted to uppercase.", payload: result});
  };

  // --- Command: lowercase_line ---
  const lowercase_line = new Command({
    name: "lowercase_line",
    parameters: [],
    type: "replaceLine",
    helpText: "Convert the current line to lowercase.",
    tutorials: [
      new TutorialCommand({command: "lowercase_line", description: "Make current line lowercase"})
    ],
    extension: extensionRoot
  });

  lowercase_line.execute = function (payload) {
    const result = payload.fullText.toLowerCase();
    return new ReturnObject({status: "success", message: "Line converted to lowercase.", payload: result});
  };

  // --- Command: sentence_case_line ---
  const sentence_case_line = new Command({
    name: "sentence_case_line",
    parameters: [],
    type: "replaceLine",
    helpText: "Convert the current line to sentence case (first letter capitalized).",
    tutorials: [
      new TutorialCommand({command: "sentence_case_line", description: "Convert current line to sentence case"})
    ],
    extension: extensionRoot
  });

  sentence_case_line.execute = function (payload) {
    const result = sentenceCase(payload.fullText);
    return new ReturnObject({status: "success", message: "Line converted to sentence case.", payload: result});
  };

  // --- Command: title_case_line ---
  const title_case_line = new Command({
    name: "title_case_line",
    parameters: [],
    type: "replaceLine",
    helpText: "Convert the current line to title case.",
    tutorials: [
      new TutorialCommand({command: "title_case_line", description: "Convert current line to title case"})
    ],
    extension: extensionRoot
  });

  title_case_line.execute = function (payload) {
    const result = titleCase(payload.fullText);
    return new ReturnObject({status: "success", message: "Line converted to title case.", payload: result});
  };

  // --- Command: camel_case ---
  const camel_case = new Command({
    name: "camel_case",
    parameters: [],
    type: "replaceLine",
    helpText: "Convert the current line to camelCase.",
    tutorials: [
      new TutorialCommand({command: "camel_case", description: "Convert line to camelCase"})
    ],
    extension: extensionRoot
  });

  camel_case.execute = function (payload) {
    const result = toCamelCase(payload.fullText);
    return new ReturnObject({status: "success", message: "Line converted to camelCase.", payload: result});
  };

  // --- Command: snake_case ---
  const snake_case = new Command({
    name: "snake_case",
    parameters: [],
    type: "replaceLine",
    helpText: "Convert the current line to snake_case.",
    tutorials: [
      new TutorialCommand({command: "snake_case", description: "Convert line to snake_case"})
    ],
    extension: extensionRoot
  });

  snake_case.execute = function (payload) {
    const result = toSnakeCase(payload.fullText);
    return new ReturnObject({status: "success", message: "Line converted to snake_case.", payload: result});
  };

  // --- Command: kebab_case ---
  const kebab_case = new Command({
    name: "kebab_case",
    parameters: [],
    type: "replaceLine",
    helpText: "Convert the current line to kebab-case.",
    tutorials: [
      new TutorialCommand({command: "kebab_case", description: "Convert line to kebab-case"})
    ],
    extension: extensionRoot
  });

  kebab_case.execute = function (payload) {
    const result = toKebabCase(payload.fullText);
    return new ReturnObject({status: "success", message: "Line converted to kebab-case.", payload: result});
  };

  // --- Command: remove_quotes_line ---
  const remove_quotes_line = new Command({
    name: "remove_quotes_line",
    parameters: [],
    type: "replaceLine",
    helpText: "Remove surrounding quotes from the current line.",
    tutorials: [
      new TutorialCommand({command: "remove_quotes_line", description: "Remove quotes from current line"})
    ],
    extension: extensionRoot
  });

  remove_quotes_line.execute = function (payload) {
    const result = removeQuotes(payload.fullText);
    return new ReturnObject({status: "success", message: "Quotes removed from line.", payload: result});
  };
})();
