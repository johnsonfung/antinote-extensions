// ===============================
// line_format: Basic Case Conversion Commands
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["line_format"];
  const extensionRoot = ctx.root;
  const CaseConverters = ctx.shared.CaseConverters;

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
    const result = CaseConverters.sentenceCase(payload.fullText);
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
    const result = CaseConverters.titleCase(payload.fullText);
    return new ReturnObject({status: "success", message: "Line converted to title case.", payload: result});
  };
})();
