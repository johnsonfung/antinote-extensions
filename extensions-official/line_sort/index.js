// ===============================
// Antinote Extension: line_sort
// Version 1.0.0
// ===============================

(function () {
  const extensionName = "line_sort";

  const extensionRoot = new Extension(
    extensionName,
    "1.0.0",
    [],
    [],
    "johnsonfung",
    "Text Manipulation",
    "full"  // Needs full document access
  );

  // --- Helper Functions ---

  const extractFirstNumber = (text) => {
    const match = text.match(/-?\d+\.?\d*/);
    return match ? parseFloat(match[0]) : null;
  };

  const extractLastNumber = (text) => {
    const matches = text.match(/-?\d+\.?\d*/g);
    return matches?.length > 0 ? parseFloat(matches[matches.length - 1]) : null;
  };

  // --- Command: sort_lines_alpha ---
  const sort_lines_alpha = new Command(
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
    const params = this.getParsedParams(payload);
    const reverse = params[0];
    const ignoreFirstLine = params[1];

    const lines = payload.fullText.split("\n");

    if (lines.length === 0) {
      return new ReturnObject("success", "No lines to sort.", payload.fullText);
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
    return new ReturnObject("success", message, result);
  };

  // --- Command: sort_lines_number ---
  const sort_lines_number = new Command(
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
    const params = this.getParsedParams(payload);
    const reverse = params[0];
    const ignoreFirstLine = params[1];

    const lines = payload.fullText.split("\n");

    if (lines.length === 0) {
      return new ReturnObject("success", "No lines to sort.", payload.fullText);
    }

    let firstLine = "";
    let linesToSort = lines;

    if (ignoreFirstLine && lines.length > 1) {
      firstLine = lines[0];
      linesToSort = lines.slice(1);
    }

    // Sort by first number in each line
    linesToSort.sort((a, b) => {
      const numA = extractFirstNumber(a);
      const numB = extractFirstNumber(b);

      // Lines without numbers go to the end
      if (numA === null && numB === null) return 0;
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
    return new ReturnObject("success", message, result);
  };

  // --- Command: sort_lines_number_last ---
  const sort_lines_number_last = new Command(
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
    const params = this.getParsedParams(payload);
    const reverse = params[0];
    const ignoreFirstLine = params[1];

    const lines = payload.fullText.split("\n");

    if (lines.length === 0) {
      return new ReturnObject("success", "No lines to sort.", payload.fullText);
    }

    let firstLine = "";
    let linesToSort = lines;

    if (ignoreFirstLine && lines.length > 1) {
      firstLine = lines[0];
      linesToSort = lines.slice(1);
    }

    // Sort by last number in each line
    linesToSort.sort((a, b) => {
      const numA = extractLastNumber(a);
      const numB = extractLastNumber(b);

      // Lines without numbers go to the end
      if (numA === null && numB === null) return 0;
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
    return new ReturnObject("success", message, result);
  };

  // --- Command: sort_lines_reverse ---
  const sort_lines_reverse = new Command(
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
    const params = this.getParsedParams(payload);
    const ignoreFirstLine = params[0];

    const lines = payload.fullText.split("\n");

    if (lines.length === 0) {
      return new ReturnObject("success", "No lines to reverse.", payload.fullText);
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

    return new ReturnObject("success", "Lines reversed.", result);
  };

  // --- Command: dedupe_lines ---
  const dedupe_lines = new Command(
    "dedupe_lines",
    [
      new Parameter("bool", "keepFirst", "Keep first occurrence (true) or last (false)", true),
      new Parameter("bool", "ignoreFirstLine", "Skip first line when deduping", false)
    ],
    "replaceAll",
    "Remove duplicate lines keeping first or last occurrence.",
    [
      new TutorialCommand("dedupe_lines", "Remove duplicates, keeping first occurrence"),
      new TutorialCommand("dedupe_lines(false)", "Remove duplicates, keeping last occurrence"),
      new TutorialCommand("dedupe_lines(true, true)", "Remove duplicates, keeping first line as header")
    ],
    extensionRoot
  );

  dedupe_lines.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const keepFirst = params[0];
    const ignoreFirstLine = params[1];

    const lines = payload.fullText.split("\n");

    if (lines.length === 0) {
      return new ReturnObject("success", "No lines to dedupe.", payload.fullText);
    }

    let firstLine = "";
    let linesToDedupe = lines;

    if (ignoreFirstLine && lines.length > 1) {
      firstLine = lines[0];
      linesToDedupe = lines.slice(1);
    }

    const seen = [];
    const unique = [];

    if (keepFirst) {
      for (const line of linesToDedupe) {
        if (!seen.includes(line)) {
          seen.push(line);
          unique.push(line);
        }
      }
    } else {
      // Keep last - process in reverse
      for (let i = linesToDedupe.length - 1; i >= 0; i--) {
        const line = linesToDedupe[i];
        if (!seen.includes(line)) {
          seen.push(line);
          unique.unshift(line); // Add to beginning to maintain order
        }
      }
    }

    const result = ignoreFirstLine && lines.length > 1
      ? [firstLine, ...unique].join("\n")
      : unique.join("\n");

    const removed = linesToDedupe.length - unique.length;
    return new ReturnObject("success", `Removed ${removed} duplicate lines, kept ${unique.length} unique.`, result);
  };

  // --- Command: get_dupes ---
  const get_dupes = new Command(
    "get_dupes",
    [
      new Parameter("bool", "ignoreFirstLine", "Skip first line when finding dupes", false)
    ],
    "insert",
    "Find and display duplicate lines grouped together.",
    [
      new TutorialCommand("get_dupes", "Find all duplicate lines"),
      new TutorialCommand("get_dupes(true)", "Find duplicates, skipping first line")
    ],
    extensionRoot
  );

  get_dupes.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const ignoreFirstLine = params[0];

    const lines = payload.fullText.split("\n");

    if (lines.length === 0) {
      return new ReturnObject("success", "No lines to check.", "# No Duplicates Found");
    }

    let linesToCheck = lines;
    if (ignoreFirstLine && lines.length > 1) {
      linesToCheck = lines.slice(1);
    }

    // Group lines by their content
    const groups = {};
    for (let i = 0; i < linesToCheck.length; i++) {
      const line = linesToCheck[i];
      if (!groups[line]) {
        groups[line] = [];
      }
      groups[line].push(i);
    }

    // Find groups with more than one line
    const dupeGroups = [];
    for (const line in groups) {
      if (groups.hasOwnProperty(line) && groups[line].length > 1) {
        dupeGroups.push({ line, count: groups[line].length });
      }
    }

    if (dupeGroups.length === 0) {
      return new ReturnObject("success", "No duplicate lines found.", "# No Duplicates Found");
    }

    // Build output
    let output = "# Duplicates Found\n\n";
    for (let i = 0; i < dupeGroups.length; i++) {
      const group = dupeGroups[i];
      output += `# Duplicate group ${i + 1} (${group.count} occurrences)\n`;
      output += `${group.line}\n\n`;
    }

    return new ReturnObject("success", `Found ${dupeGroups.length} duplicate line groups.`, output);
  };
})();
