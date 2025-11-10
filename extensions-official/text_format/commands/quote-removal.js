// ===============================
// text_format: Quote Removal Command
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["text_format"];
  const extensionRoot = ctx.root;
  const CaseConverters = ctx.shared.CaseConverters;

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
    const result = lines.map(line => CaseConverters.removeQuotes(line));
    return new ReturnObject({status: "success", message: "Quotes removed from document.", payload: result.join("\n")});
  };
})();
