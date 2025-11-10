// ===============================
// line_format: Code Case Conversion Commands
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["line_format"];
  const extensionRoot = ctx.root;
  const CaseConverters = ctx.shared.CaseConverters;

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
    const result = CaseConverters.toCamelCase(payload.fullText);
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
    const result = CaseConverters.toSnakeCase(payload.fullText);
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
    const result = CaseConverters.toKebabCase(payload.fullText);
    return new ReturnObject({status: "success", message: "Line converted to kebab-case.", payload: result});
  };
})();
