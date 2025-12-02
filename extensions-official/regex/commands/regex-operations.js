// ===============================
// regex: Regex Operation Commands
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["regex"];
  const extensionRoot = ctx.root;
  const RegexParser = ctx.shared.RegexParser;

  // --- Command: regex_remove ---
  const regex_remove = new Command({
    name: "regex_remove",
    parameters: [
      new Parameter({type: "string", name: "expression", helpText: "Regex pattern (plain or /pattern/flags format)", default: "\\d+", required: true})
    ],
    type: "replaceAll",
    helpText: "Remove all text matching the regex pattern.",
    tutorials: [
      new TutorialCommand({command: "regex_remove('\\\\d+')", description: "Remove all numbers"}),
      new TutorialCommand({command: "regex_remove('/TODO/g')", description: "Remove all TODO (case-sensitive)"}),
      new TutorialCommand({command: "regex_remove('^\\\\s+')", description: "Remove leading whitespace from all lines"})
    ],
    extension: extensionRoot
  });

  regex_remove.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const expression = params[0];

    try {
      const regex = RegexParser.parseRegex(expression, 'gi');
      const result = payload.fullText.replace(regex, '');

      return new ReturnObject({
        status: "success",
        message: `Removed matches for pattern "${expression}".`,
        payload: result
      });
    } catch (e) {
      return new ReturnObject({
        status: "error",
        message: `Error parsing regex: ${e.message}`,
        payload: payload.fullText
      });
    }
  };

  // --- Command: regex_keep ---
  const regex_keep = new Command({
    name: "regex_keep",
    parameters: [
      new Parameter({type: "string", name: "expression", helpText: "Regex pattern (plain or /pattern/flags format)", default: "\\d+", required: true})
    ],
    type: "replaceAll",
    helpText: "Keep only text matching the regex pattern.",
    tutorials: [
      new TutorialCommand({command: "regex_keep('\\\\d+')", description: "Keep only numbers"}),
      new TutorialCommand({command: "regex_keep('/[A-Z]+/g')", description: "Keep only uppercase letters"}),
      new TutorialCommand({command: "regex_keep('\\\\w+@\\\\w+\\\\.\\\\w+')", description: "Keep only email-like patterns"})
    ],
    extension: extensionRoot
  });

  regex_keep.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const expression = params[0];

    try {
      const regex = RegexParser.parseRegex(expression, 'gi');
      const matches = payload.fullText.match(regex);

      if (!matches || matches.length === 0) {
        return new ReturnObject({
          status: "error",
          message: `No matches found for pattern "${expression}".`,
          payload: payload.fullText
        });
      }

      const result = matches.join('');

      return new ReturnObject({
        status: "success",
        message: `Kept ${matches.length} match(es) for pattern "${expression}".`,
        payload: result
      });
    } catch (e) {
      return new ReturnObject({
        status: "error",
        message: `Error parsing regex: ${e.message}`,
        payload: payload.fullText
      });
    }
  };

  // --- Command: regex_insert ---
  const regex_insert = new Command({
    name: "regex_insert",
    parameters: [
      new Parameter({type: "string", name: "expression", helpText: "Regex pattern (plain or /pattern/flags format)", default: "\\d+", required: true}),
      new Parameter({type: "string", name: "delimiter", helpText: "Delimiter to use between matches", default: "\n", required: false})
    ],
    type: "replaceAll",
    helpText: "Extract and insert regex matches with a delimiter.",
    tutorials: [
      new TutorialCommand({command: "regex_insert('\\\\d+')", description: "Extract all numbers to lines"}),
      new TutorialCommand({command: "regex_insert('\\\\w+@\\\\w+\\\\.\\\\w+', ', ')", description: "Extract emails as comma-separated"}),
      new TutorialCommand({command: "regex_insert('/https?:\\\\/\\\\/[^\\\\s]+/gi')", description: "Extract all URLs to lines"})
    ],
    extension: extensionRoot
  });

  regex_insert.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const expression = params[0];
    const delimiter = params[1];

    try {
      const regex = RegexParser.parseRegex(expression, 'gi');
      const matches = payload.fullText.match(regex);

      if (!matches || matches.length === 0) {
        return new ReturnObject({
          status: "error",
          message: `No matches found for pattern "${expression}".`,
          payload: payload.fullText
        });
      }

      const result = matches.join(delimiter);

      return new ReturnObject({
        status: "success",
        message: `Inserted ${matches.length} match(es) for pattern "${expression}".`,
        payload: result
      });
    } catch (e) {
      return new ReturnObject({
        status: "error",
        message: `Error parsing regex: ${e.message}`,
        payload: payload.fullText
      });
    }
  };
})();
