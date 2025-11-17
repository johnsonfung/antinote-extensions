// ===============================
// filter_lines: Remove Lines Commands
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["filter_lines"];
  const extensionRoot = ctx.root;
  const TextUtils = ctx.shared.TextUtils;

  // --- Command: remove_lines_with ---
  const remove_lines_with = new Command({
    name: "remove_lines_with",
    parameters: [
      new Parameter({type: "string", name: "text", helpText: "Text to search for in lines"}),
      new Parameter({type: "bool", name: "caseSensitive", helpText: "Case sensitive matching", default: false})
    ],
    type: "replaceAll",
    helpText: "Remove all lines containing the specified text.",
    tutorials: [
      new TutorialCommand({command: "remove_lines_with('TODO')", description: "Remove lines containing TODO"}),
      new TutorialCommand({command: "remove_lines_with('error', true)", description: "Remove lines with 'error' (case-sensitive)"})
    ],
    extension: extensionRoot
  });

  remove_lines_with.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const searchText = params[0];
    const caseSensitive = params[1];

    const lines = payload.fullText.split("\n");
    const filteredLines = lines.filter(line => !TextUtils.contains(line, searchText, caseSensitive));

    const result = filteredLines.join("\n");
    const removedCount = lines.length - filteredLines.length;

    return new ReturnObject({
      status: "success",
      message: `Removed ${removedCount} line(s) containing "${searchText}".`,
      payload: result
    });
  };

  // --- Command: remove_lines_without ---
  const remove_lines_without = new Command({
    name: "remove_lines_without",
    parameters: [
      new Parameter({type: "string", name: "text", helpText: "Text that must be in lines to keep"}),
      new Parameter({type: "bool", name: "caseSensitive", helpText: "Case sensitive matching", default: false})
    ],
    type: "replaceAll",
    helpText: "Remove all lines that do NOT contain the specified text.",
    tutorials: [
      new TutorialCommand({command: "remove_lines_without('TODO')", description: "Keep only lines with TODO"}),
      new TutorialCommand({command: "remove_lines_without('error', true)", description: "Keep only lines with 'error' (case-sensitive)"})
    ],
    extension: extensionRoot
  });

  remove_lines_without.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const searchText = params[0];
    const caseSensitive = params[1];

    const lines = payload.fullText.split("\n");
    const filteredLines = lines.filter(line => TextUtils.contains(line, searchText, caseSensitive));

    const result = filteredLines.join("\n");
    const removedCount = lines.length - filteredLines.length;

    return new ReturnObject({
      status: "success",
      message: `Removed ${removedCount} line(s) not containing "${searchText}".`,
      payload: result
    });
  };

  // --- Command: remove_lines_empty ---
  const remove_lines_empty = new Command({
    name: "remove_lines_empty",
    parameters: [],
    type: "replaceAll",
    helpText: "Remove all empty lines from the document.",
    tutorials: [
      new TutorialCommand({command: "remove_lines_empty", description: "Remove all empty lines"})
    ],
    extension: extensionRoot
  });

  remove_lines_empty.execute = function (payload) {
    const lines = payload.fullText.split("\n");
    const filteredLines = lines.filter(line => line.trim().length > 0);

    const result = filteredLines.join("\n");
    const removedCount = lines.length - filteredLines.length;

    return new ReturnObject({
      status: "success",
      message: `Removed ${removedCount} empty line(s).`,
      payload: result
    });
  };

  // --- Command: keep_lines_with ---
  const keep_lines_with = new Command({
    name: "keep_lines_with",
    parameters: [
      new Parameter({type: "string", name: "text", helpText: "Text to search for in lines"}),
      new Parameter({type: "bool", name: "caseSensitive", helpText: "Case sensitive matching", default: false})
    ],
    type: "replaceAll",
    helpText: "Keep only lines containing the specified text.",
    tutorials: [
      new TutorialCommand({command: "keep_lines_with('TODO')", description: "Keep only lines containing TODO"}),
      new TutorialCommand({command: "keep_lines_with('error', true)", description: "Keep only lines with 'error' (case-sensitive)"})
    ],
    extension: extensionRoot
  });

  keep_lines_with.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const searchText = params[0];
    const caseSensitive = params[1];

    const lines = payload.fullText.split("\n");
    const filteredLines = lines.filter(line => TextUtils.contains(line, searchText, caseSensitive));

    const result = filteredLines.join("\n");
    const keptCount = filteredLines.length;

    return new ReturnObject({
      status: "success",
      message: `Kept ${keptCount} line(s) containing "${searchText}".`,
      payload: result
    });
  };

  // --- Command: keep_lines_without ---
  const keep_lines_without = new Command({
    name: "keep_lines_without",
    parameters: [
      new Parameter({type: "string", name: "text", helpText: "Text that must NOT be in lines to keep"}),
      new Parameter({type: "bool", name: "caseSensitive", helpText: "Case sensitive matching", default: false})
    ],
    type: "replaceAll",
    helpText: "Keep only lines that do NOT contain the specified text.",
    tutorials: [
      new TutorialCommand({command: "keep_lines_without('TODO')", description: "Remove lines containing TODO"}),
      new TutorialCommand({command: "keep_lines_without('error', true)", description: "Remove lines with 'error' (case-sensitive)"})
    ],
    extension: extensionRoot
  });

  keep_lines_without.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const searchText = params[0];
    const caseSensitive = params[1];

    const lines = payload.fullText.split("\n");
    const filteredLines = lines.filter(line => !TextUtils.contains(line, searchText, caseSensitive));

    const result = filteredLines.join("\n");
    const keptCount = filteredLines.length;

    return new ReturnObject({
      status: "success",
      message: `Kept ${keptCount} line(s) not containing "${searchText}".`,
      payload: result
    });
  };
})();
