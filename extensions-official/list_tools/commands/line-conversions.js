// ===============================
// list_tools: Line Conversion Commands
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["list_tools"];
  const extensionRoot = ctx.root;

  // --- Command: lines_to_commas ---
  const lines_to_commas = new Command({
    name: "lines_to_commas",
    parameters: [],
    type: "replaceAll",
    helpText: "Convert lines to comma-separated list.",
    tutorials: [
      new TutorialCommand({command: "lines_to_commas", description: "Convert lines to comma-separated"})
    ],
    extension: extensionRoot
  });

  lines_to_commas.execute = function (payload) {
    const lines = payload.fullText.split("\n");
    const result = lines.join(", ");

    return new ReturnObject({
      status: "success",
      message: `Converted ${lines.length} line(s) to comma-separated list.`,
      payload: result
    });
  };

  // --- Command: lines_to ---
  const lines_to = new Command({
    name: "lines_to",
    parameters: [
      new Parameter({type: "string", name: "delimiter", helpText: "Delimiter to use for joining lines", default: "|", required: true})
    ],
    type: "replaceAll",
    helpText: "Convert lines to custom delimiter-separated list.",
    tutorials: [
      new TutorialCommand({command: "lines_to('|')", description: "Convert lines to pipe-separated"}),
      new TutorialCommand({command: "lines_to(' | ')", description: "Convert lines to pipe with spaces"})
    ],
    extension: extensionRoot
  });

  lines_to.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const delimiter = params[0];

    const lines = payload.fullText.split("\n");
    const result = lines.join(delimiter);

    return new ReturnObject({
      status: "success",
      message: `Converted ${lines.length} line(s) to "${delimiter}"-separated list.`,
      payload: result
    });
  };
})();
