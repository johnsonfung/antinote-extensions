// ===============================
// line_sort: Numeric Sorting
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["line_sort"];
  const extensionRoot = ctx.root;
  const Extractors = ctx.shared.Extractors;

  // --- Command: sort_lines_number ---
  const sort_lines_number = new Command({
    name: "sort_lines_number",
    parameters: [
      new Parameter({type: "bool", name: "reverse", helpText: "Sort in reverse order", default: false}),
      new Parameter({type: "bool", name: "ignoreFirstLine", helpText: "Skip first line when sorting", default: false})
    ],
    type: "replaceAll",
    helpText: "Sort lines by the first number found in each line.",
    tutorials: [
      new TutorialCommand({command: "sort_lines_number", description: "Sort lines by first number"}),
      new TutorialCommand({command: "sort_lines_number(true)", description: "Sort lines by first number in reverse"}),
      new TutorialCommand({command: "sort_lines_number(false, true)", description: "Sort by first number, keeping first line in place"}),
      new TutorialCommand({command: "sort_lines_number(true, true)", description: "Sort by first number in reverse, keeping first line in place"})
    ],
    extension: extensionRoot
  });

  sort_lines_number.execute = function (payload) {
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

    // Sort by first number in each line
    linesToSort.sort((a, b) => {
      const numA = Extractors.extractFirstNumber(a);
      const numB = Extractors.extractFirstNumber(b);

      // Lines without numbers - sort alphabetically
      if (numA === null && numB === null) {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        if (aLower < bLower) return reverse ? 1 : -1;
        if (aLower > bLower) return reverse ? -1 : 1;
        return 0;
      }
      if (numA === null) return 1;
      if (numB === null) return -1;

      if (numA < numB) return reverse ? 1 : -1;
      if (numA > numB) return reverse ? -1 : 1;
      return 0;
    });

    const result = ignoreFirstLine && lines.length > 1
      ? [firstLine, ...linesToSort].join("\n")
      : linesToSort.join("\n");

    const message = reverse ? "Lines sorted by first number (reverse)." : "Lines sorted by first number.";
    return new ReturnObject({status: "success", message: message, payload: result});
  };

  // --- Command: sort_lines_number_last ---
  const sort_lines_number_last = new Command({
    name: "sort_lines_number_last",
    parameters: [
      new Parameter({type: "bool", name: "reverse", helpText: "Sort in reverse order", default: false}),
      new Parameter({type: "bool", name: "ignoreFirstLine", helpText: "Skip first line when sorting", default: false})
    ],
    type: "replaceAll",
    helpText: "Sort lines by the last number found in each line.",
    tutorials: [
      new TutorialCommand({command: "sort_lines_number_last", description: "Sort lines by last number"}),
      new TutorialCommand({command: "sort_lines_number_last(true)", description: "Sort lines by last number in reverse"}),
      new TutorialCommand({command: "sort_lines_number_last(false, true)", description: "Sort by last number, keeping first line in place"}),
      new TutorialCommand({command: "sort_lines_number_last(true, true)", description: "Sort by last number in reverse, keeping first line in place"})
    ],
    extension: extensionRoot
  });

  sort_lines_number_last.execute = function (payload) {
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

    // Sort by last number in each line
    linesToSort.sort((a, b) => {
      const numA = Extractors.extractLastNumber(a);
      const numB = Extractors.extractLastNumber(b);

      // Lines without numbers - sort alphabetically
      if (numA === null && numB === null) {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        if (aLower < bLower) return reverse ? 1 : -1;
        if (aLower > bLower) return reverse ? -1 : 1;
        return 0;
      }
      if (numA === null) return 1;
      if (numB === null) return -1;

      if (numA < numB) return reverse ? 1 : -1;
      if (numA > numB) return reverse ? -1 : 1;
      return 0;
    });

    const result = ignoreFirstLine && lines.length > 1
      ? [firstLine, ...linesToSort].join("\n")
      : linesToSort.join("\n");

    const message = reverse ? "Lines sorted by last number (reverse)." : "Lines sorted by last number.";
    return new ReturnObject({status: "success", message: message, payload: result});
  };
})();
