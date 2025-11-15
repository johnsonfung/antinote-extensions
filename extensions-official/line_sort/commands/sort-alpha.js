// ===============================
// line_sort: Alphabetical Sorting
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["line_sort"];
  const extensionRoot = ctx.root;

  // --- Command: sort_lines_alpha ---
  const sort_lines_alpha = new Command({
    name: "sort_lines_alpha",
    parameters: [
      new Parameter({type: "bool", name: "reverse", helpText: "Sort in reverse order", default: false}),
      new Parameter({type: "bool", name: "ignoreFirstLine", helpText: "Skip first line when sorting", default: false})
    ],
    type: "replaceAll",
    helpText: "Sort lines alphabetically with optional reverse and skip first line.",
    tutorials: [
      new TutorialCommand({command: "sort_lines_alpha", description: "Sort lines alphabetically"}),
      new TutorialCommand({command: "sort_lines_alpha(true)", description: "Sort lines in reverse alphabetical order"}),
      new TutorialCommand({command: "sort_lines_alpha(false, true)", description: "Sort lines alphabetically, keeping first line in place"}),
      new TutorialCommand({command: "sort_lines_alpha(true, true)", description: "Sort lines in reverse, keeping first line in place"})
    ],
    extension: extensionRoot
  });

  sort_lines_alpha.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const reverse = params[0];
    const ignoreFirstLine = params[1];

    const lines = payload.fullText.split("\n").filter(line => line.trim() !== '');

    if (lines.length === 0) {
      return new ReturnObject({status: "success", message: "No lines to sort.", payload: payload.fullText});
    }

    let firstLine = "";
    let linesToSort = lines;

    if (ignoreFirstLine && lines.length > 1) {
      firstLine = lines[0];
      linesToSort = lines.slice(1);
    }

    // Sort alphabetically (case-insensitive)
    linesToSort.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      if (aLower < bLower) return reverse ? 1 : -1;
      if (aLower > bLower) return reverse ? -1 : 1;
      return 0;
    });

    const result = ignoreFirstLine && lines.length > 1
      ? [firstLine, ...linesToSort].join("\n")
      : linesToSort.join("\n");

    const message = reverse ? "Lines sorted in reverse alphabetical order." : "Lines sorted alphabetically.";
    return new ReturnObject({status: "success", message: message, payload: result});
  };
})();
