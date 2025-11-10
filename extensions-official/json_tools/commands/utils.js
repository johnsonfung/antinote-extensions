// JSON utility commands (get, set, format)

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["json_tools"];
  const SmartExtractor = ctx.shared.SmartExtractor;
  const Formatters = ctx.shared.Formatters;
  const extensionRoot = ctx.root;

  // Helper: Parse value - try as number, then boolean, then JSON, then string
  const parseValue = (value) => {
    if (value === '') {
      return null;
    }

    // Try to parse as JSON first (for objects/arrays)
    try {
      return JSON.parse(value);
    } catch (e) {
      // If not valid JSON, return as string
      return value;
    }
  };

  // Command: json_get
  const json_get = new Command({
    name: "json_get",
    parameters: [
      new Parameter({type: "string", name: "path", helpText: "Dot notation path to value (e.g., 'user.name')", default: ""})
    ],
    type: "insert",
    helpText: "Get value at a specific path using dot notation.",
    tutorials: [
      new TutorialCommand({command: "json_get('user.name')", description: "Get user.name value"}),
      new TutorialCommand({command: "json_get('config.settings.timeout')", description: "Get nested value"}),
      new TutorialCommand({command: "json_get('items')", description: "Get items array"})
    ],
    extension: extensionRoot
  });

  json_get.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const path = params[0];

    if (!path) {
      return new ReturnObject({status: "error", message: "Path parameter is required.", payload: ""});
    }

    const formatPref = Formatters.getFormatPreference();
    const fullText = payload.fullText || "";

    try {
      // Extract using the path
      const extraction = SmartExtractor.extract(fullText, path);
      const value = extraction.processed;

      // Format output based on type
      let output;
      if (typeof value === 'object' && value !== null) {
        output = SmartExtractor.format(value, formatPref);
      } else {
        output = String(value);
      }

      return new ReturnObject({
        status: "success",
        message: `Retrieved value at '${path}'.`,
        payload: output
      });
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };

  // Command: json_set
  const json_set = new Command({
    name: "json_set",
    parameters: [
      new Parameter({type: "string", name: "path", helpText: "Dot notation path to set (e.g., 'user.name')", default: ""}),
      new Parameter({type: "string", name: "value", helpText: "New value (supports JSON for objects/arrays)", default: ""}),
      new Parameter({type: "string", name: "parent_key", helpText: "Parent key to find JSON object (optional)", default: ""})
    ],
    type: "replaceAll",
    helpText: "Set value at a specific path using dot notation.",
    tutorials: [
      new TutorialCommand({command: "json_set('user.name', 'John')", description: "Set user.name to 'John'"}),
      new TutorialCommand({command: "json_set('config.timeout', '5000')", description: "Set config.timeout to 5000"}),
      new TutorialCommand({command: "json_set('status', 'active')", description: "Set status field"}),
      new TutorialCommand({command: "json_set('user.roles', '[\"admin\",\"user\"]')", description: "Set array value"})
    ],
    extension: extensionRoot
  });

  json_set.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const path = params[0];
    const value = params[1];
    const parent_key = params[2] || "";

    if (!path) {
      return new ReturnObject({status: "error", message: "Path parameter is required.", payload: ""});
    }

    const formatPref = Formatters.getFormatPreference();
    const fullText = payload.fullText || "";
    const parsedValue = parseValue(value);

    try {
      // Extract all matching objects
      const extractions = SmartExtractor.extractAll(fullText, parent_key);

      // Process each extraction
      const newValues = extractions.map(ext => {
        const data = ext.processed;

        // Set the nested value
        SmartExtractor.setNestedValue(data, path, parsedValue);

        return data;
      });

      // If only one extraction, return it directly
      if (extractions.length === 1) {
        const output = SmartExtractor.format(newValues[0], formatPref);
        return new ReturnObject({
          status: "success",
          message: `Set '${path}' to '${value}'.`,
          payload: output
        });
      }

      // Reconstruct text with all updates
      const result = SmartExtractor.reconstructAll(fullText, extractions, newValues, formatPref);

      return new ReturnObject({
        status: "success",
        message: `Set '${path}' to '${value}' in ${extractions.length} objects.`,
        payload: result
      });
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };

  // Command: json_format
  const json_format = new Command({
    name: "json_format",
    parameters: [
      new Parameter({type: "string", name: "parent_key", helpText: "Parent key to find JSON object (optional)", default: ""})
    ],
    type: "replaceAll",
    helpText: "Reformat JSON according to user preference (pretty/compact/minified).",
    tutorials: [
      new TutorialCommand({command: "json_format", description: "Reformat entire JSON document"}),
      new TutorialCommand({command: "json_format('data')", description: "Reformat JSON at 'data' key"}),
      new TutorialCommand({command: "json_format('users')", description: "Reformat users array"})
    ],
    extension: extensionRoot
  });

  json_format.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const parent_key = params[0] || "";

    const formatPref = Formatters.getFormatPreference();
    const fullText = payload.fullText || "";

    try {
      // Extract all matching objects
      const extractions = SmartExtractor.extractAll(fullText, parent_key);

      // If only one extraction, return it directly formatted
      if (extractions.length === 1) {
        const output = SmartExtractor.format(extractions[0].processed, formatPref);
        return new ReturnObject({
          status: "success",
          message: `Formatted JSON using '${formatPref}' style.`,
          payload: output
        });
      }

      // Reconstruct text with all formatted objects
      const newValues = extractions.map(ext => ext.processed);
      const result = SmartExtractor.reconstructAll(fullText, extractions, newValues, formatPref);

      return new ReturnObject({
        status: "success",
        message: `Formatted ${extractions.length} JSON objects using '${formatPref}' style.`,
        payload: result
      });
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };
})();
