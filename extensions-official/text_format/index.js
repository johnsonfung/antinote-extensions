// ===============================
// Antinote Extension: text_format
// Version 1.0.0
// ===============================

(function () {
  const extensionName = "text_format";

  const extensionRoot = new Extension({
    name: extensionName,
    version: "1.0.0",
    endpoints: [],
    requiredAPIKeys: [],
    author: "johnsonfung",
    category: "Text Formatting",
    dataScope: "full"  // Needs full document access
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

  // --- Command: replace ---
  const replace = new Command({
    name: "replace",
    parameters: [
      new Parameter({type: "string", name: "find", helpText: "Text to find", default: ""}),
      new Parameter({type: "string", name: "replaceWith", helpText: "Text to replace with", default: ""})
    ],
    type: "replaceAll",
    helpText: "Find and replace text throughout the entire document.",
    tutorials: [
      new TutorialCommand("replace(old, new)", "Replace 'old' with 'new'"),
      new TutorialCommand("replace(foo, bar)", "Replace all 'foo' with 'bar'")
    ],
    extension: extensionRoot
  });

  replace.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const find = params[0];
    const replaceWith = params[1];

    if (!find) {
      return new ReturnObject({status: "error", message: "Please provide text to find."});
    }

    const result = payload.fullText.split(find).join(replaceWith);
    return new ReturnObject({status: "success", message: "Text replaced.", payload: result});
  };

  // --- Command: append ---
  const append = new Command({
    name: "append",
    parameters: [
      new Parameter({type: "string", name: "text", helpText: "Text to append to each line", default: ""})
    ],
    type: "replaceAll",
    helpText: "Add text to the end of every line in the document.",
    tutorials: [
      new TutorialCommand({command: "append(;)", description: "Add semicolon to end of each line"}),
      new TutorialCommand({command: "append( ->)", description: "Add arrow to end of each line"})
    ],
    extension: extensionRoot
  });

  append.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const text = params[0];

    const lines = payload.fullText.split("\n");
    const result = lines.map(line =>
      // Only append to non-empty lines
      line.trim().length > 0 ? line + text : line
    );

    return new ReturnObject({status: "success", message: "Text appended to all lines.", payload: result.join("\n")});
  };

  // --- Command: prepend ---
  const prepend = new Command({
    name: "prepend",
    parameters: [
      new Parameter({type: "string", name: "text", helpText: "Text to prepend to each line", default: ""})
    ],
    type: "replaceAll",
    helpText: "Add text to the beginning of every line in the document.",
    tutorials: [
      new TutorialCommand({command: "prepend(- )", description: "Add dash bullet to each line"}),
      new TutorialCommand({command: "prepend(> )", description: "Add quote marker to each line"})
    ],
    extension: extensionRoot
  });

  prepend.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const text = params[0];

    const lines = payload.fullText.split("\n");
    const result = lines.map(line =>
      // Only prepend to non-empty lines
      line.trim().length > 0 ? text + line : line
    );

    return new ReturnObject({status: "success", message: "Text prepended to all lines.", payload: result.join("\n")});
  };

  // --- Command: uppercase ---
  const uppercase = new Command({
    name: "uppercase",
    parameters: [],
    type: "replaceAll",
    helpText: "Convert the entire document to uppercase.",
    tutorials: [
      new TutorialCommand({command: "uppercase", description: "Make entire document uppercase"})
    ],
    extension: extensionRoot
  });

  uppercase.execute = function (payload) {
    const result = payload.fullText.toUpperCase();
    return new ReturnObject({status: "success", message: "Document converted to uppercase.", payload: result});
  };

  // --- Command: lowercase ---
  const lowercase = new Command({
    name: "lowercase",
    parameters: [],
    type: "replaceAll",
    helpText: "Convert the entire document to lowercase.",
    tutorials: [
      new TutorialCommand({command: "lowercase", description: "Make entire document lowercase"})
    ],
    extension: extensionRoot
  });

  lowercase.execute = function (payload) {
    const result = payload.fullText.toLowerCase();
    return new ReturnObject({status: "success", message: "Document converted to lowercase.", payload: result});
  };

  // --- Command: sentence_case ---
  const sentence_case = new Command({
    name: "sentence_case",
    parameters: [],
    type: "replaceAll",
    helpText: "Convert the entire document to sentence case.",
    tutorials: [
      new TutorialCommand({command: "sentence_case", description: "Convert entire document to sentence case"})
    ],
    extension: extensionRoot
  });

  sentence_case.execute = function (payload) {
    const lines = payload.fullText.split("\n");
    const result = lines.map(line => sentenceCase(line));
    return new ReturnObject({status: "success", message: "Document converted to sentence case.", payload: result.join("\n")});
  };

  // --- Command: title_case ---
  const title_case = new Command({
    name: "title_case",
    parameters: [],
    type: "replaceAll",
    helpText: "Convert the entire document to title case.",
    tutorials: [
      new TutorialCommand({command: "title_case", description: "Convert entire document to title case"})
    ],
    extension: extensionRoot
  });

  title_case.execute = function (payload) {
    const lines = payload.fullText.split("\n");
    const result = lines.map(line => titleCase(line));
    return new ReturnObject({status: "success", message: "Document converted to title case.", payload: result.join("\n")});
  };

  // --- Command: capitalize_first ---
  const capitalize_first = new Command({
    name: "capitalize_first",
    parameters: [],
    type: "replaceAll",
    helpText: "Capitalize the first letter of each line in the document.",
    tutorials: [
      new TutorialCommand({command: "capitalize_first", description: "Capitalize first letter of each line"})
    ],
    extension: extensionRoot
  });

  capitalize_first.execute = function (payload) {
    const lines = payload.fullText.split("\n");
    const result = lines.map(line =>
      line.length > 0 ? line.charAt(0).toUpperCase() + line.slice(1) : line
    );
    return new ReturnObject({status: "success", message: "First letter of each line capitalized.", payload: result.join("\n")});
  };

  // --- Command: remove_quotes ---
  const remove_quotes = new Command({
    name: "remove_quotes",
    parameters: [],
    type: "replaceAll",
    helpText: "Remove surrounding quotes from each line in the document.",
    tutorials: [
      new TutorialCommand({command: "remove_quotes", description: "Remove quotes from all lines"})
    ],
    extension: extensionRoot
  });

  remove_quotes.execute = function (payload) {
    const lines = payload.fullText.split("\n");
    const result = lines.map(line => removeQuotes(line));
    return new ReturnObject({status: "success", message: "Quotes removed from document.", payload: result.join("\n")});
  };
})();
