// JSON filtering commands

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["json_tools"];
  const SmartExtractor = ctx.shared.SmartExtractor;
  const Formatters = ctx.shared.Formatters;
  const extensionRoot = ctx.root;

  // Helper: Compare operator
  const compareValues = (a, b, operator) => {
    switch (operator) {
      case '=':
      case '==':
        return a == b;
      case '!=':
        return a != b;
      case '>':
        return parseFloat(a) > parseFloat(b);
      case '<':
        return parseFloat(a) < parseFloat(b);
      case '>=':
        return parseFloat(a) >= parseFloat(b);
      case '<=':
        return parseFloat(a) <= parseFloat(b);
      case 'contains':
        return String(a).includes(String(b));
      case 'startsWith':
        return String(a).startsWith(String(b));
      case 'endsWith':
        return String(a).endsWith(String(b));
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  };

  // Helper: Find array of objects in parsed data
  const findArrayOfObjects = (data, parentKey) => {
    if (parentKey) {
      // Look for specific key
      if (data?.[parentKey]) {
        if (Array.isArray(data[parentKey]) && data[parentKey].length > 0 && typeof data[parentKey][0] === 'object') {
          return { array: data[parentKey], isRoot: false, parentKey };
        }
      }
      throw new Error(`Could not find array of objects at key '${parentKey}'`);
    }

    // If root is array of objects, use it
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      return { array: data, isRoot: true, parentKey: null };
    }

    // Search for first array of objects
    if (data && typeof data === 'object') {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const value = data[key];
          if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
            return { array: value, isRoot: false, parentKey: key };
          }
        }
      }
    }

    throw new Error("Could not find an array of objects in the document");
  };

  // Helper: Reconstruct JSON maintaining structure
  const reconstructJSON = (data, result, isRoot, parentKey, formatPref) => {
    if (isRoot) {
      return SmartExtractor.format(result, formatPref);
    } else {
      data[parentKey] = result;
      return SmartExtractor.format(data, formatPref);
    }
  };

  // Command: json_filter
  const json_filter = new Command({
    name: "json_filter",
    parameters: [
      new Parameter({type: "string", name: "key", helpText: "Key to filter by", default: ""}),
      new Parameter({type: "string", name: "operator", helpText: "Comparison operator (=, !=, >, <, >=, <=, contains, startsWith, endsWith)", default: "="}),
      new Parameter({type: "string", name: "value", helpText: "Value to compare against", default: ""}),
      new Parameter({type: "string", name: "parent_key", helpText: "Parent key containing the array (optional)", default: ""})
    ],
    type: "replaceAll",
    helpText: "Filter array of objects keeping only items matching criteria.",
    tutorials: [
      new TutorialCommand({command: "json_filter('status', '=', 'active')", description: "Keep only active items"}),
      new TutorialCommand({command: "json_filter('age', '>', '18')", description: "Keep items where age > 18"}),
      new TutorialCommand({command: "json_filter('name', 'contains', 'John')", description: "Keep items where name contains John"}),
      new TutorialCommand({command: "json_filter('verified', '=', 'true', 'users')", description: "Filter users array where verified is true"})
    ],
    extension: extensionRoot
  });

  json_filter.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const key = params[0];
    const operator = params[1] || "=";
    const value = params[2];
    const parent_key = params[3] || "";

    if (!key) {
      return new ReturnObject({status: "error", message: "Key parameter is required.", payload: ""});
    }

    const formatPref = Formatters.getFormatPreference();
    const fullText = payload.fullText || "";

    try {
      // Extract all matching objects/arrays
      const extractions = SmartExtractor.extractAll(fullText, parent_key);

      // Process each extraction
      const newValues = extractions.map(ext => {
        const data = ext.processed;
        const found = findArrayOfObjects(data, "");
        const array = found.array;

        const originalLength = array.length;
        const filtered = array.filter(obj =>
          obj.hasOwnProperty(key) && compareValues(obj[key], value, operator)
        );

        return {
          value: reconstructJSON(data, filtered, found.isRoot, found.parentKey, formatPref),
          originalLength,
          filteredLength: filtered.length
        };
      });

      // If only one extraction, return it directly
      if (extractions.length === 1) {
        const result = newValues[0];
        return new ReturnObject({
          status: "success",
          message: `Filtered to ${result.filteredLength} items (from ${result.originalLength}).`,
          payload: result.value
        });
      }

      // Reconstruct text with all updates
      const result = SmartExtractor.reconstructAll(fullText, extractions, newValues.map(v => JSON.parse(v.value)), formatPref);
      const totalOriginal = newValues.reduce((sum, v) => sum + v.originalLength, 0);
      const totalFiltered = newValues.reduce((sum, v) => sum + v.filteredLength, 0);

      return new ReturnObject({
        status: "success",
        message: `Filtered ${extractions.length} arrays to ${totalFiltered} items (from ${totalOriginal}).`,
        payload: result
      });
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };

  // Command: json_filter_out
  const json_filter_out = new Command({
    name: "json_filter_out",
    parameters: [
      new Parameter({type: "string", name: "key", helpText: "Key to filter by", default: ""}),
      new Parameter({type: "string", name: "operator", helpText: "Comparison operator", default: "="}),
      new Parameter({type: "string", name: "value", helpText: "Value to compare against", default: ""}),
      new Parameter({type: "string", name: "parent_key", helpText: "Parent key containing the array (optional)", default: ""})
    ],
    type: "replaceAll",
    helpText: "Filter array of objects removing items matching criteria.",
    tutorials: [
      new TutorialCommand({command: "json_filter_out('status', '=', 'deleted')", description: "Remove deleted items"}),
      new TutorialCommand({command: "json_filter_out('age', '<', '18')", description: "Remove items where age < 18"}),
      new TutorialCommand({command: "json_filter_out('spam', '=', 'true', 'messages')", description: "Remove spam from messages array"})
    ],
    extension: extensionRoot
  });

  json_filter_out.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const key = params[0];
    const operator = params[1] || "=";
    const value = params[2];
    const parent_key = params[3] || "";

    if (!key) {
      return new ReturnObject({status: "error", message: "Key parameter is required.", payload: ""});
    }

    const formatPref = Formatters.getFormatPreference();
    const fullText = payload.fullText || "";

    try {
      // Extract all matching objects/arrays
      const extractions = SmartExtractor.extractAll(fullText, parent_key);

      // Process each extraction
      const newValues = extractions.map(ext => {
        const data = ext.processed;
        const found = findArrayOfObjects(data, "");
        const array = found.array;

        const originalLength = array.length;
        const filtered = array.filter(obj =>
          !obj.hasOwnProperty(key) || !compareValues(obj[key], value, operator)
        );

        return {
          value: reconstructJSON(data, filtered, found.isRoot, found.parentKey, formatPref),
          originalLength,
          filteredLength: filtered.length,
          removedCount: originalLength - filtered.length
        };
      });

      // If only one extraction, return it directly
      if (extractions.length === 1) {
        const result = newValues[0];
        return new ReturnObject({
          status: "success",
          message: `Removed ${result.removedCount} items, kept ${result.filteredLength}.`,
          payload: result.value
        });
      }

      // Reconstruct text with all updates
      const result = SmartExtractor.reconstructAll(fullText, extractions, newValues.map(v => JSON.parse(v.value)), formatPref);
      const totalRemoved = newValues.reduce((sum, v) => sum + v.removedCount, 0);
      const totalKept = newValues.reduce((sum, v) => sum + v.filteredLength, 0);

      return new ReturnObject({
        status: "success",
        message: `Removed ${totalRemoved} items from ${extractions.length} arrays, kept ${totalKept}.`,
        payload: result
      });
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };
})();
