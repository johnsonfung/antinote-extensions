// ===============================
// line_sort: Deduplication Commands
// ===============================

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["line_sort"];
  const extensionRoot = ctx.root;

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
