// ===============================
// Antinote Extension: line_sort
// Version 1.0.0
// ===============================

(function () {
  var extensionName = "line_sort";

  var extensionRoot = new Extension(
    extensionName,
    "1.0.0",
    [],
    [],
    "johnsonfung",
    "Text Manipulation",
    "full"  // Needs full document access
  );

  // --- Helper Functions ---

  function extractFirstNumber(text) {
    var match = text.match(/-?\d+\.?\d*/);
    return match ? parseFloat(match[0]) : null;
  }

  function extractLastNumber(text) {
    var matches = text.match(/-?\d+\.?\d*/g);
    return matches && matches.length > 0 ? parseFloat(matches[matches.length - 1]) : null;
  }

  // --- Command: sort_lines_alpha ---
  var sort_lines_alpha = new Command(
    "sort_lines_alpha",
    [
      new Parameter("bool", "reverse", "Sort in reverse order", false),
      new Parameter("bool", "ignoreFirstLine", "Skip first line when sorting", false)
    ],
    "replaceAll",
    "Sort lines alphabetically with optional reverse and skip first line.",
    [
      new TutorialCommand("sort_lines_alpha", "Sort lines alphabetically"),
      new TutorialCommand("sort_lines_alpha(true)", "Sort lines in reverse alphabetical order"),
      new TutorialCommand("sort_lines_alpha(false, true)", "Sort lines alphabetically, keeping first line in place"),
      new TutorialCommand("sort_lines_alpha(true, true)", "Sort lines in reverse, keeping first line in place")
    ],
    extensionRoot
  );

  sort_lines_alpha.execute = function (payload) {
    var params = this.getParsedParams(payload);
    var reverse = params[0];
    var ignoreFirstLine = params[1];

    var lines = payload.fullText.split("\n");

    if (lines.length === 0) {
      return new ReturnObject("success", "No lines to sort.", payload.fullText);
    }

    var firstLine = "";
    var linesToSort = lines;

    if (ignoreFirstLine && lines.length > 1) {
      firstLine = lines[0];
      linesToSort = lines.slice(1);
    }

    // Sort alphabetically (case-insensitive)
    linesToSort.sort(function(a, b) {
      var aLower = a.toLowerCase();
      var bLower = b.toLowerCase();
      if (aLower < bLower) return reverse ? 1 : -1;
      if (aLower > bLower) return reverse ? -1 : 1;
      return 0;
    });

    var result = ignoreFirstLine && lines.length > 1
      ? [firstLine].concat(linesToSort).join("\n")
      : linesToSort.join("\n");

    var message = reverse ? "Lines sorted in reverse alphabetical order." : "Lines sorted alphabetically.";
    return new ReturnObject("success", message, result);
  };

  // --- Command: sort_lines_number ---
  var sort_lines_number = new Command(
    "sort_lines_number",
    [
      new Parameter("bool", "reverse", "Sort in reverse order", false),
      new Parameter("bool", "ignoreFirstLine", "Skip first line when sorting", false)
    ],
    "replaceAll",
    "Sort lines by the first number found in each line.",
    [
      new TutorialCommand("sort_lines_number", "Sort lines by first number"),
      new TutorialCommand("sort_lines_number(true)", "Sort lines by first number in reverse"),
      new TutorialCommand("sort_lines_number(false, true)", "Sort by first number, keeping first line in place"),
      new TutorialCommand("sort_lines_number(true, true)", "Sort by first number in reverse, keeping first line in place")
    ],
    extensionRoot
  );

  sort_lines_number.execute = function (payload) {
    var params = this.getParsedParams(payload);
    var reverse = params[0];
    var ignoreFirstLine = params[1];

    var lines = payload.fullText.split("\n");

    if (lines.length === 0) {
      return new ReturnObject("success", "No lines to sort.", payload.fullText);
    }

    var firstLine = "";
    var linesToSort = lines;

    if (ignoreFirstLine && lines.length > 1) {
      firstLine = lines[0];
      linesToSort = lines.slice(1);
    }

    // Sort by first number in each line
    linesToSort.sort(function(a, b) {
      var numA = extractFirstNumber(a);
      var numB = extractFirstNumber(b);

      // Lines without numbers go to the end
      if (numA === null && numB === null) return 0;
      if (numA === null) return 1;
      if (numB === null) return -1;

      if (numA < numB) return reverse ? 1 : -1;
      if (numA > numB) return reverse ? -1 : 1;
      return 0;
    });

    var result = ignoreFirstLine && lines.length > 1
      ? [firstLine].concat(linesToSort).join("\n")
      : linesToSort.join("\n");

    var message = reverse ? "Lines sorted by first number (reverse)." : "Lines sorted by first number.";
    return new ReturnObject("success", message, result);
  };

  // --- Command: sort_lines_number_last ---
  var sort_lines_number_last = new Command(
    "sort_lines_number_last",
    [
      new Parameter("bool", "reverse", "Sort in reverse order", false),
      new Parameter("bool", "ignoreFirstLine", "Skip first line when sorting", false)
    ],
    "replaceAll",
    "Sort lines by the last number found in each line.",
    [
      new TutorialCommand("sort_lines_number_last", "Sort lines by last number"),
      new TutorialCommand("sort_lines_number_last(true)", "Sort lines by last number in reverse"),
      new TutorialCommand("sort_lines_number_last(false, true)", "Sort by last number, keeping first line in place"),
      new TutorialCommand("sort_lines_number_last(true, true)", "Sort by last number in reverse, keeping first line in place")
    ],
    extensionRoot
  );

  sort_lines_number_last.execute = function (payload) {
    var params = this.getParsedParams(payload);
    var reverse = params[0];
    var ignoreFirstLine = params[1];

    var lines = payload.fullText.split("\n");

    if (lines.length === 0) {
      return new ReturnObject("success", "No lines to sort.", payload.fullText);
    }

    var firstLine = "";
    var linesToSort = lines;

    if (ignoreFirstLine && lines.length > 1) {
      firstLine = lines[0];
      linesToSort = lines.slice(1);
    }

    // Sort by last number in each line
    linesToSort.sort(function(a, b) {
      var numA = extractLastNumber(a);
      var numB = extractLastNumber(b);

      // Lines without numbers go to the end
      if (numA === null && numB === null) return 0;
      if (numA === null) return 1;
      if (numB === null) return -1;

      if (numA < numB) return reverse ? 1 : -1;
      if (numA > numB) return reverse ? -1 : 1;
      return 0;
    });

    var result = ignoreFirstLine && lines.length > 1
      ? [firstLine].concat(linesToSort).join("\n")
      : linesToSort.join("\n");

    var message = reverse ? "Lines sorted by last number (reverse)." : "Lines sorted by last number.";
    return new ReturnObject("success", message, result);
  };

  // --- Command: sort_lines_reverse ---
  var sort_lines_reverse = new Command(
    "sort_lines_reverse",
    [
      new Parameter("bool", "ignoreFirstLine", "Skip first line when reversing", false)
    ],
    "replaceAll",
    "Reverse the order of lines in the document.",
    [
      new TutorialCommand("sort_lines_reverse", "Reverse all lines"),
      new TutorialCommand("sort_lines_reverse(true)", "Reverse lines, keeping first line in place")
    ],
    extensionRoot
  );

  sort_lines_reverse.execute = function (payload) {
    var params = this.getParsedParams(payload);
    var ignoreFirstLine = params[0];

    var lines = payload.fullText.split("\n");

    if (lines.length === 0) {
      return new ReturnObject("success", "No lines to reverse.", payload.fullText);
    }

    var firstLine = "";
    var linesToReverse = lines;

    if (ignoreFirstLine && lines.length > 1) {
      firstLine = lines[0];
      linesToReverse = lines.slice(1);
    }

    // Reverse the array
    linesToReverse.reverse();

    var result = ignoreFirstLine && lines.length > 1
      ? [firstLine].concat(linesToReverse).join("\n")
      : linesToReverse.join("\n");

    return new ReturnObject("success", "Lines reversed.", result);
  };
})();
