/**
 * Payload Context Demo Extension
 * Demonstrates how extensions can access note metadata through the payload
 */

var payloadContextDemo = new Extension({
  name: "Payload Context Demo",
  version: "1.0.0",
  author: "Antinote",
  category: "Utilities",
  dataScope: "line"  // Only needs line access - metadata comes via payload!
});

/**
 * Show active keywords
 * Displays which keywords are active in the current note
 */
new Command({
  name: "show_keywords",
  parameters: [],
  extension: payloadContextDemo,
  type: "insert",
  helpText: "Shows which keywords are active in the current note",
  execute: function(payload) {
    // Access active keywords directly from payload
    var activeKeywords = payload.activeKeywords || [];

    if (activeKeywords.length === 0) {
      return new ReturnObject({
        status: "success",
        message: "No keywords active in this note",
        payload: "(no active keywords)"
      });
    }

    return new ReturnObject({
      status: "success",
      message: "Active keywords: " + activeKeywords.join(", "),
      payload: "Active: [" + activeKeywords.join(", ") + "]"
    });
  }
});

/**
 * Remove checked items
 * Removes all checked checkbox items from the note
 * Uses payload.checkedCheckboxTriggers to respect user's configuration
 */
new Command({
  name: "remove_checked",
  parameters: [],
  extension: payloadContextDemo,
  type: "replaceAll",
  dataScope: "full",  // Needs full text to remove checked items
  helpText: "Removes all checked checkbox items from the note",
  execute: function(payload) {
    // Check if LIST keyword is active using payload
    var hasListKeyword = payload.activeKeywords && payload.activeKeywords.indexOf("list") !== -1;

    if (!hasListKeyword) {
      return new ReturnObject({
        status: "error",
        message: "This command only works when 'list' keyword is active",
        payload: payload.fullText
      });
    }

    // Get checked checkbox triggers from payload
    var checkedTriggers = payload.checkedCheckboxTriggers || ["/x"];
    console.log("Checked triggers from payload:", checkedTriggers);

    // Split text into lines
    var lines = payload.fullText.split('\n');
    var resultLines = [];
    var removedCount = 0;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var isChecked = false;

      // Check if this line starts with any of the checked triggers
      var trimmedLine = line.trim();
      for (var j = 0; j < checkedTriggers.length; j++) {
        if (trimmedLine.indexOf(checkedTriggers[j]) === 0) {
          isChecked = true;
          removedCount++;
          break;
        }
      }

      // Only keep unchecked lines
      if (!isChecked) {
        resultLines.push(line);
      }
    }

    var result = resultLines.join('\n');

    return new ReturnObject({
      status: "success",
      message: "Removed " + removedCount + " checked item(s)",
      payload: result
    });
  }
});

/**
 * Check for math mode
 * Example of conditional behavior based on keyword detection
 * Notice: dataScope is "none" - we don't need note content!
 */
new Command({
  name: "check_math",
  parameters: [],
  extension: payloadContextDemo,
  type: "insert",
  dataScope: "none",  // Privacy-conscious: no note content needed
  helpText: "Checks if MATH keyword is active",
  execute: function(payload) {
    // Even with dataScope: "none", we can check keywords from payload!
    var hasMath = payload.activeKeywords && payload.activeKeywords.indexOf("math") !== -1;
    var message = hasMath
      ? "Math mode is ACTIVE"
      : "Math mode is NOT active";

    return new ReturnObject({
      status: "success",
      message: message,
      payload: message
    });
  }
});

/**
 * Count active keywords
 * Shows how many keywords are currently active
 */
new Command({
  name: "count_keywords",
  parameters: [],
  extension: payloadContextDemo,
  type: "insert",
  dataScope: "none",
  helpText: "Counts how many keywords are active",
  execute: function(payload) {
    var count = (payload.activeKeywords || []).length;
    var message = count === 0
      ? "No keywords active"
      : count + " keyword(s) active";

    return new ReturnObject({
      status: "success",
      message: message,
      payload: message
    });
  }
});
