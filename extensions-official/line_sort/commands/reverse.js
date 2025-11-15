// ===============================
// line_sort: Line Reversal
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["line_sort"];
  const extensionRoot = ctx.root;

  // --- Command: sort_lines_reverse ---
  const sort_lines_reverse = new Command({
    name: "sort_lines_reverse",
    parameters: [
      new Parameter({type: "bool", name: "ignoreFirstLine", helpText: "Skip first line when reversing", default: false})
    ],
    type: "replaceAll",
    helpText: "Reverse the order of lines in the document.",
    tutorials: [
      new TutorialCommand({command: "sort_lines_reverse", description: "Reverse all lines"}),
      new TutorialCommand({command: "sort_lines_reverse(true)", description: "Reverse lines, keeping first line in place"})
    ],
    extension: extensionRoot
  });

  sort_lines_reverse.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const ignoreFirstLine = params[0];

    const lines = payload.fullText.split("\n").filter(line => line.trim() !== '');

    if (lines.length === 0) {
      return new ReturnObject({status: "success", message: "No lines to reverse.", payload: payload.fullText});
    }

    let firstLine = "";
    let linesToReverse = lines;

    if (ignoreFirstLine && lines.length > 1) {
      firstLine = lines[0];
      linesToReverse = lines.slice(1);
    }

    // Reverse the array
    linesToReverse.reverse();

    const result = ignoreFirstLine && lines.length > 1
      ? [firstLine, ...linesToReverse].join("\n")
      : linesToReverse.join("\n");

    return new ReturnObject({status: "success", message: "Lines reversed.", payload: result});
  };
})();
