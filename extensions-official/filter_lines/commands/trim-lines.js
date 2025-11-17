// ===============================
// filter_lines: Trim Lines Command
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["filter_lines"];
  const extensionRoot = ctx.root;

  // --- Command: trim_each_whitespace ---
  const trim_each_whitespace = new Command({
    name: "trim_each_whitespace",
    parameters: [],
    type: "replaceAll",
    helpText: "Remove leading and trailing whitespace from every line.",
    tutorials: [
      new TutorialCommand({command: "trim_each_whitespace", description: "Trim whitespace from all lines"})
    ],
    extension: extensionRoot
  });

  trim_each_whitespace.execute = function (payload) {
    const lines = payload.fullText.split("\n");
    const trimmedLines = lines.map(line => line.trim());

    const result = trimmedLines.join("\n");

    return new ReturnObject({
      status: "success",
      message: "Trimmed whitespace from all lines.",
      payload: result
    });
  };
})();
