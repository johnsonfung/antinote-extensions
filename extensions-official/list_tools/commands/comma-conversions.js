// ===============================
// list_tools: Comma Conversion Commands
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["list_tools"];
  const extensionRoot = ctx.root;
  const Parser = ctx.shared.Parser;

  // --- Command: commas_to_list ---
  const commas_to_list = new Command({
    name: "commas_to_list",
    parameters: [
      new Parameter({type: "bool", name: "trimWhitespace", helpText: "Trim whitespace from each item", default: true, required: false}),
      new Parameter({type: "string", name: "quoteChar", helpText: "Quote character to respect (empty for all quotes)", default: "", required: false})
    ],
    type: "replaceAll",
    helpText: "Convert comma-separated items to lines.",
    tutorials: [
      new TutorialCommand({command: "commas_to_list", description: "Convert comma-separated to lines"}),
      new TutorialCommand({command: "commas_to_list(false)", description: "Convert without trimming whitespace"}),
      new TutorialCommand({command: 'commas_to_list(true, "\'")', description: "Respect only single quotes"})
    ],
    extension: extensionRoot
  });

  commas_to_list.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const trimWhitespace = params[0];
    const quoteChar = params[1] || null;

    const items = Parser.parseCommaList(payload.fullText, trimWhitespace, quoteChar);
    const result = items.join("\n");

    return new ReturnObject({
      status: "success",
      message: `Converted ${items.length} comma-separated item(s) to lines.`,
      payload: result
    });
  };

  // --- Command: commas_to ---
  const commas_to = new Command({
    name: "commas_to",
    parameters: [
      new Parameter({type: "string", name: "delimiter", helpText: "Delimiter to use for output", default: "|", required: true}),
      new Parameter({type: "bool", name: "trimWhitespace", helpText: "Trim whitespace from each item", default: true, required: false}),
      new Parameter({type: "string", name: "quoteChar", helpText: "Quote character to respect (empty for all quotes)", default: "", required: false})
    ],
    type: "replaceAll",
    helpText: "Convert comma-separated items to custom delimiter.",
    tutorials: [
      new TutorialCommand({command: "commas_to('|')", description: "Convert commas to pipes"}),
      new TutorialCommand({command: "commas_to(';', false)", description: "Convert commas to semicolons without trimming"})
    ],
    extension: extensionRoot
  });

  commas_to.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const delimiter = params[0];
    const trimWhitespace = params[1];
    const quoteChar = params[2] || null;

    const items = Parser.parseCommaList(payload.fullText, trimWhitespace, quoteChar);
    const result = items.join(delimiter);

    return new ReturnObject({
      status: "success",
      message: `Converted ${items.length} comma-separated item(s) to "${delimiter}"-separated.`,
      payload: result
    });
  };
})();
