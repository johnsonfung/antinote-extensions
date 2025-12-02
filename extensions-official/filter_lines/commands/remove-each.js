// ===============================
// filter_lines: Remove Each After/Before Commands
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["filter_lines"];
  const extensionRoot = ctx.root;
  const TextUtils = ctx.shared.TextUtils;

  // --- Command: remove_each_after ---
  const remove_each_after = new Command({
    name: "remove_each_after",
    parameters: [
      new Parameter({type: "string", name: "delimiter", helpText: "Text to remove content after", default: ",", required: true}),
      new Parameter({type: "int", name: "occurrence", helpText: "Which occurrence to use (1 = first, 2 = second, etc.)", default: 1, required: false})
    ],
    type: "replaceAll",
    helpText: "Remove content after the specified delimiter on each line.",
    tutorials: [
      new TutorialCommand({command: "remove_each_after(',')", description: "Remove everything after first comma"}),
      new TutorialCommand({command: "remove_each_after(',', 2)", description: "Remove everything after second comma"})
    ],
    extension: extensionRoot
  });

  remove_each_after.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const delimiter = params[0];
    const occurrence = params[1];

    const lines = payload.fullText.split("\n");
    const processedLines = lines.map(line => {
      const index = TextUtils.findNthOccurrence(line, delimiter, occurrence, true);
      if (index === -1) return line;
      return line.substring(0, index);
    });

    const result = processedLines.join("\n");

    return new ReturnObject({
      status: "success",
      message: `Removed content after "${delimiter}" (occurrence ${occurrence}) on each line.`,
      payload: result
    });
  };

  // --- Command: remove_each_before ---
  const remove_each_before = new Command({
    name: "remove_each_before",
    parameters: [
      new Parameter({type: "string", name: "delimiter", helpText: "Text to remove content before", default: ",", required: true}),
      new Parameter({type: "int", name: "occurrence", helpText: "Which occurrence from the end (1 = last, 2 = second-to-last, etc.)", default: 1, required: false})
    ],
    type: "replaceAll",
    helpText: "Remove content before the specified delimiter on each line.",
    tutorials: [
      new TutorialCommand({command: "remove_each_before(',')", description: "Remove everything before last comma"}),
      new TutorialCommand({command: "remove_each_before(',', 2)", description: "Remove everything before second-to-last comma"})
    ],
    extension: extensionRoot
  });

  remove_each_before.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const delimiter = params[0];
    const occurrence = params[1];

    const lines = payload.fullText.split("\n");
    const processedLines = lines.map(line => {
      // Find all occurrences
      const indices = [];
      let pos = 0;
      while (pos < line.length) {
        const index = line.indexOf(delimiter, pos);
        if (index === -1) break;
        indices.push(index);
        pos = index + 1;
      }

      if (indices.length === 0) return line;

      // Get the Nth from the end
      const targetIndex = indices[indices.length - occurrence];
      if (targetIndex === undefined) return line;

      return line.substring(targetIndex + delimiter.length);
    });

    const result = processedLines.join("\n");

    return new ReturnObject({
      status: "success",
      message: `Removed content before "${delimiter}" (occurrence ${occurrence} from end) on each line.`,
      payload: result
    });
  };
})();
