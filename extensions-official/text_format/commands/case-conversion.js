// ===============================
// text_format: Case Conversion Commands
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["text_format"];
  const extensionRoot = ctx.root;
  const CaseConverters = ctx.shared.CaseConverters;

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
    const result = lines.map(line => CaseConverters.sentenceCase(line));
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
    const result = lines.map(line => CaseConverters.titleCase(line));
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
})();
