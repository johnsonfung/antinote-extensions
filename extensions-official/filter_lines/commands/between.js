// ===============================
// filter_lines: Keep/Remove Between Commands
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["filter_lines"];
  const extensionRoot = ctx.root;

  // --- Command: keep_between ---
  const keep_between = new Command({
    name: "keep_between",
    parameters: [
      new Parameter({type: "string", name: "start", helpText: "Start boundary text", default: "[", required: true}),
      new Parameter({type: "string", name: "end", helpText: "End boundary text", default: "]", required: true}),
      new Parameter({type: "bool", name: "includeBoundaries", helpText: "Include the boundary delimiters in result", default: false, required: false})
    ],
    type: "replaceAll",
    helpText: "Keep only content between start and end delimiters on each line.",
    tutorials: [
      new TutorialCommand({command: "keep_between('[', ']')", description: "Keep content between brackets"}),
      new TutorialCommand({command: "keep_between('(', ')', true)", description: "Keep content including parentheses"})
    ],
    extension: extensionRoot
  });

  keep_between.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const start = params[0];
    const end = params[1];
    const includeBoundaries = params[2];

    const lines = payload.fullText.split("\n");
    const processedLines = lines.map(line => {
      const startIndex = line.indexOf(start);
      if (startIndex === -1) return "";

      const searchFrom = startIndex + start.length;
      const endIndex = line.indexOf(end, searchFrom);
      if (endIndex === -1) return "";

      if (includeBoundaries) {
        return line.substring(startIndex, endIndex + end.length);
      } else {
        return line.substring(startIndex + start.length, endIndex);
      }
    });

    const result = processedLines.join("\n");

    return new ReturnObject({
      status: "success",
      message: `Kept content between "${start}" and "${end}" on each line.`,
      payload: result
    });
  };

  // --- Command: remove_between ---
  const remove_between = new Command({
    name: "remove_between",
    parameters: [
      new Parameter({type: "string", name: "start", helpText: "Start boundary text", default: "[", required: true}),
      new Parameter({type: "string", name: "end", helpText: "End boundary text", default: "]", required: true}),
      new Parameter({type: "bool", name: "includeBoundaries", helpText: "Remove the boundary delimiters as well", default: false, required: false})
    ],
    type: "replaceAll",
    helpText: "Remove content between start and end delimiters on each line.",
    tutorials: [
      new TutorialCommand({command: "remove_between('[', ']')", description: "Remove content between brackets"}),
      new TutorialCommand({command: "remove_between('(', ')', true)", description: "Remove content including parentheses"})
    ],
    extension: extensionRoot
  });

  remove_between.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const start = params[0];
    const end = params[1];
    const includeBoundaries = params[2];

    const lines = payload.fullText.split("\n");
    const processedLines = lines.map(line => {
      const startIndex = line.indexOf(start);
      if (startIndex === -1) return line;

      const searchFrom = startIndex + start.length;
      const endIndex = line.indexOf(end, searchFrom);
      if (endIndex === -1) return line;

      if (includeBoundaries) {
        return line.substring(0, startIndex) + line.substring(endIndex + end.length);
      } else {
        return line.substring(0, startIndex + start.length) + line.substring(endIndex);
      }
    });

    const result = processedLines.join("\n");

    return new ReturnObject({
      status: "success",
      message: `Removed content between "${start}" and "${end}" on each line.`,
      payload: result
    });
  };
})();
