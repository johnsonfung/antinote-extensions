// ===============================
// checklists: Checked Item Commands
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["checklists"];
  const extensionRoot = ctx.root;

  /**
   * Helper function to check if a line is checked
   * @param {string} line - The line to check
   * @param {string[]} checkedTriggers - Array of checked triggers
   * @returns {boolean} - True if line ends with a checked trigger
   */
  function isLineChecked(line, checkedTriggers) {
    const trimmedLine = line.trim();
    for (let i = 0; i < checkedTriggers.length; i++) {
      if (trimmedLine.endsWith(checkedTriggers[i])) {
        return true;
      }
    }
    return false;
  }

  /**
   * Helper function to validate list keyword is active
   * @param {object} payload - The command payload
   * @returns {string|null} - Error message if invalid, null if valid
   */
  function validateListKeyword(payload) {
    const hasListKeyword = payload.activeKeywords && payload.activeKeywords.indexOf("list") !== -1;
    if (!hasListKeyword) {
      return "This command only works when 'list' keyword is active";
    }
    return null;
  }

  // --- Command: checked_to_bottom ---
  const checked_to_bottom = new Command({
    name: "checked_to_bottom",
    parameters: [],
    type: "replaceAll",
    dataScope: "full",
    helpText: "Move all checked items to the bottom of the list while maintaining their order",
    tutorials: [
      new TutorialCommand({command: "checked_to_bottom", description: "Move checked items to the bottom"})
    ],
    extension: extensionRoot
  });

  checked_to_bottom.execute = function(payload) {
    // Validate list keyword is active
    const error = validateListKeyword(payload);
    if (error) {
      return new ReturnObject({
        status: "error",
        message: error,
        payload: payload.fullText
      });
    }

    // Get checked checkbox triggers from payload
    const checkedTriggers = payload.checkedCheckboxTriggers || ["/x"];

    // Split text into lines
    const lines = payload.fullText.split('\n');
    const uncheckedLines = [];
    const checkedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isLineChecked(line, checkedTriggers)) {
        checkedLines.push(line);
      } else {
        uncheckedLines.push(line);
      }
    }

    // If no checked items found, return original
    if (checkedLines.length === 0) {
      return new ReturnObject({
        status: "success",
        message: "No checked items found",
        payload: payload.fullText
      });
    }

    // Combine: unchecked items first, blank line, then checked items
    const result = uncheckedLines.join('\n') + '\n\n' + checkedLines.join('\n');

    return new ReturnObject({
      status: "success",
      message: "Moved " + checkedLines.length + " checked item(s) to bottom",
      payload: result
    });
  };

  // --- Command: remove_checked ---
  const remove_checked = new Command({
    name: "remove_checked",
    parameters: [],
    type: "replaceAll",
    dataScope: "full",
    helpText: "Remove all checked items from the list",
    tutorials: [
      new TutorialCommand({command: "remove_checked", description: "Remove all checked items"})
    ],
    extension: extensionRoot
  });

  remove_checked.execute = function(payload) {
    // Validate list keyword is active
    const error = validateListKeyword(payload);
    if (error) {
      return new ReturnObject({
        status: "error",
        message: error,
        payload: payload.fullText
      });
    }

    // Get checked checkbox triggers from payload
    const checkedTriggers = payload.checkedCheckboxTriggers || ["/x"];

    // Split text into lines
    const lines = payload.fullText.split('\n');
    const resultLines = [];
    let removedCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isLineChecked(line, checkedTriggers)) {
        removedCount++;
      } else {
        resultLines.push(line);
      }
    }

    // If nothing was removed, return original text
    if (removedCount === 0) {
      return new ReturnObject({
        status: "success",
        message: "No checked items found",
        payload: payload.fullText
      });
    }

    const result = resultLines.join('\n');

    return new ReturnObject({
      status: "success",
      message: "Removed " + removedCount + " checked item(s)",
      payload: result
    });
  };
})();
