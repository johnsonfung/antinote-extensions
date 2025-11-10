// ===============================
// line_format: Quote Removal Command
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["line_format"];
  const extensionRoot = ctx.root;
  const CaseConverters = ctx.shared.CaseConverters;

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
    const result = CaseConverters.removeQuotes(payload.fullText);
    return new ReturnObject({status: "success", message: "Quotes removed from line.", payload: result});
  };
})();
