// ===============================
// clean_line: Whitespace Commands
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["clean_line"];
  const extensionRoot = ctx.root;

  // --- Command: remove_all_whitespace ---
  const remove_all_whitespace = new Command({
    name: "remove_all_whitespace",
    parameters: [],
    type: "replaceLine",
    helpText: "Remove all whitespace from the current line.",
    tutorials: [
      new TutorialCommand({command: "remove_all_whitespace", description: "Remove all whitespace from current line"})
    ],
    extension: extensionRoot
  });

  remove_all_whitespace.execute = function (payload) {
    const result = payload.fullText.replace(/\s/g, '');
    return new ReturnObject({
      status: "success",
      message: "Removed all whitespace from line.",
      payload: result
    });
  };

  // --- Command: trim_whitespace ---
  const trim_whitespace = new Command({
    name: "trim_whitespace",
    parameters: [],
    type: "replaceLine",
    helpText: "Remove leading and trailing whitespace from the current line.",
    tutorials: [
      new TutorialCommand({command: "trim_whitespace", description: "Trim whitespace from current line"})
    ],
    extension: extensionRoot
  });

  trim_whitespace.execute = function (payload) {
    const result = payload.fullText.trim();
    return new ReturnObject({
      status: "success",
      message: "Trimmed whitespace from line.",
      payload: result
    });
  };
})();
