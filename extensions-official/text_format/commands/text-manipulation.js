// ===============================
// text_format: Text Manipulation Commands
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["text_format"];
  const extensionRoot = ctx.root;

  // --- Command: replace ---
  const replace = new Command({
    name: "replace",
    parameters: [
      new Parameter({type: "string", name: "find", helpText: "Text to find", default: ""}),
      new Parameter({type: "string", name: "replaceWith", helpText: "Text to replace with", default: ""})
    ],
    type: "replaceAll",
    helpText: "Find and replace text throughout the entire document.",
    tutorials: [
      new TutorialCommand({command: "replace(old, new)", description: "Replace 'old' with 'new'"}),
      new TutorialCommand({command: "replace(foo, bar)", description: "Replace all 'foo' with 'bar'"})
    ],
    extension: extensionRoot
  });

  replace.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const find = params[0];
    const replaceWith = params[1];

    if (!find) {
      return new ReturnObject({status: "error", message: "Please provide text to find."});
    }

    const result = payload.fullText.split(find).join(replaceWith);
    return new ReturnObject({status: "success", message: "Text replaced.", payload: result});
  };

  // --- Command: append ---
  const append = new Command({
    name: "append",
    parameters: [
      new Parameter({type: "string", name: "text", helpText: "Text to append to each line", default: ""})
    ],
    type: "replaceAll",
    helpText: "Add text to the end of every line in the document.",
    tutorials: [
      new TutorialCommand({command: "append(;)", description: "Add semicolon to end of each line"}),
      new TutorialCommand({command: "append( ->)", description: "Add arrow to end of each line"})
    ],
    extension: extensionRoot
  });

  append.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const text = params[0];

    const lines = payload.fullText.split("\n");
    const result = lines.map(line =>
      // Only append to non-empty lines
      line.trim().length > 0 ? line + text : line
    );

    return new ReturnObject({status: "success", message: "Text appended to all lines.", payload: result.join("\n")});
  };

  // --- Command: prepend ---
  const prepend = new Command({
    name: "prepend",
    parameters: [
      new Parameter({type: "string", name: "text", helpText: "Text to prepend to each line", default: ""})
    ],
    type: "replaceAll",
    helpText: "Add text to the beginning of every line in the document.",
    tutorials: [
      new TutorialCommand({command: "prepend(- )", description: "Add dash bullet to each line"}),
      new TutorialCommand({command: "prepend(> )", description: "Add quote marker to each line"})
    ],
    extension: extensionRoot
  });

  prepend.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const text = params[0];

    const lines = payload.fullText.split("\n");
    const result = lines.map(line =>
      // Only prepend to non-empty lines
      line.trim().length > 0 ? text + line : line
    );

    return new ReturnObject({status: "success", message: "Text prepended to all lines.", payload: result.join("\n")});
  };
})();
