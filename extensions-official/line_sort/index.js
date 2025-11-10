// ===============================
// Antinote Extension: line_sort
// Version 1.0.0
// ===============================

(function () {
  const extensionName = "line_sort";

  const extensionRoot = new Extension({
    name: extensionName,
    version: "1.0.0",
    endpoints: [],
    requiredAPIKeys: [],
    author: "johnsonfung",
    category: "Text Manipulation",
    dataScope: "full"  // Needs full document access
  });

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
  const sort_lines_alpha = new Command({
    name: "sort_lines_alpha",
    parameters: [
      new Parameter({type: "bool", name: "reverse", helpText: "Sort in reverse order", default: false}),
      new Parameter({type: "bool", name: "ignoreFirstLine", helpText: "Skip first line when sorting", default: false})
    ],
    type: "replaceAll",
    helpText: "Sort lines alphabetically with optional reverse and skip first line.",
    tutorials: [
      new TutorialCommand({command: "sort_lines_alpha", description: "Sort lines alphabetically"}),
      new TutorialCommand({command: "sort_lines_alpha(true)", description: "Sort lines in reverse alphabetical order"}),
      new TutorialCommand({command: "sort_lines_alpha(false, true)", description: "Sort lines alphabetically, keeping first line in place"}),
      new TutorialCommand({command: "sort_lines_alpha(true, true)", description: "Sort lines in reverse, keeping first line in place"})
    ],
    extension: extensionRoot
  });

  sort_lines_alpha.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const reverse = params[0];
    const ignoreFirstLine = params[1];

    const lines = payload.fullText.split("\n");

    if (lines.length === 0) {
      return new ReturnObject({status: "success", message: "No lines to sort.", payload: payload.fullText});
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
    return new ReturnObject({status: "success", message: message, payload: result});
  };

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

    const lines = payload.fullText.split("\n");

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

    const lines = payload.fullText.split("\n");

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
    return new ReturnObject({status: "success", message: message, payload: result});
  };

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

    const lines = payload.fullText.split("\n");

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

  // --- Command: dedupe_lines ---
  const dedupe_lines = new Command({
    name: "dedupe_lines",
    parameters: [
      new Parameter({type: "bool", name: "keepFirst", helpText: "Keep first occurrence (true) or last (false)", default: true}),
      new Parameter({type: "bool", name: "ignoreFirstLine", helpText: "Skip first line when deduping", default: false})
    ],
    type: "replaceAll",
    helpText: "Remove duplicate lines keeping first or last occurrence.",
    tutorials: [
      new TutorialCommand({command: "dedupe_lines", description: "Remove duplicates, keeping first occurrence"}),
      new TutorialCommand({command: "dedupe_lines(false)", description: "Remove duplicates, keeping last occurrence"}),
      new TutorialCommand({command: "dedupe_lines(true, true)", description: "Remove duplicates, keeping first line as header"})
    ],
    extension: extensionRoot
  });

  dedupe_lines.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const keepFirst = params[0];
    const ignoreFirstLine = params[1];

    const lines = payload.fullText.split("\n");

    if (lines.length === 0) {
      return new ReturnObject({status: "success", message: "No lines to dedupe.", payload: payload.fullText});
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
    return new ReturnObject({status: "success", message: `Removed ${removed} duplicate lines, kept ${unique.length} unique.`, payload: result});
  };

  // --- Command: get_dupes ---
  const get_dupes = new Command({
    name: "get_dupes",
    parameters: [
      new Parameter({type: "bool", name: "ignoreFirstLine", helpText: "Skip first line when finding dupes", default: false})
    ],
    type: "insert",
    helpText: "Find and display duplicate lines grouped together.",
    tutorials: [
      new TutorialCommand({command: "get_dupes", description: "Find all duplicate lines"}),
      new TutorialCommand({command: "get_dupes(true)", description: "Find duplicates, skipping first line"})
    ],
    extension: extensionRoot
  });

  get_dupes.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const ignoreFirstLine = params[0];

    const lines = payload.fullText.split("\n");

    if (lines.length === 0) {
      return new ReturnObject({status: "success", message: "No lines to check.", payload: "# No Duplicates Found"});
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
      return new ReturnObject({status: "success", message: "No duplicate lines found.", payload: "# No Duplicates Found"});
    }

    // Build output
    let output = "# Duplicates Found\n\n";
    for (let i = 0; i < dupeGroups.length; i++) {
      const group = dupeGroups[i];
      output += `# Duplicate group ${i + 1} (${group.count} occurrences)\n`;
      output += `${group.line}\n\n`;
    }

    return new ReturnObject({status: "success", message: `Found ${dupeGroups.length} duplicate line groups.`, payload: output});
  };
})();
