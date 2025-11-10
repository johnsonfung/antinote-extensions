// JSON key manipulation commands

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["json_tools"];
  const SmartExtractor = ctx.shared.SmartExtractor;
  const Formatters = ctx.shared.Formatters;
  const extensionRoot = ctx.root;

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

  // Helper: Parse value - try as number, then boolean, then string
  const parseValue = (value) => {
    if (value === '') {
      return null;
    } else if (!isNaN(parseFloat(value)) && isFinite(value)) {
      return parseFloat(value);
    } else if (value === 'true') {
      return true;
    } else if (value === 'false') {
      return false;
    }
    return value;
  };

  // Command: json_add_key
  const json_add_key = new Command({
    name: "json_add_key",
    parameters: [
      new Parameter({type: "string", name: "key", helpText: "Key to add", default: ""}),
      new Parameter({type: "string", name: "value", helpText: "Value for the key (blank = null)", default: ""}),
      new Parameter({type: "string", name: "parent_key", helpText: "Parent key containing the array (optional)", default: ""})
    ],
    type: "replaceAll",
    helpText: "Add a key-value pair to all objects in array.",
    tutorials: [
      new TutorialCommand({command: "json_add_key('status', 'active')", description: "Add status=active to all objects"}),
      new TutorialCommand({command: "json_add_key('created', '')", description: "Add created=null to all objects"}),
      new TutorialCommand({command: "json_add_key('verified', 'true', 'users')", description: "Add verified=true to users array"})
    ],
    extension: extensionRoot
  });

  json_add_key.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const key = params[0];
    const value = params[1];
    const parent_key = params[2] || "";

    if (!key) {
      return new ReturnObject({status: "error", message: "Key parameter is required.", payload: ""});
    }

    const formatPref = Formatters.getFormatPreference();
    const fullText = payload.fullText || "";
    const parsedValue = parseValue(value);

    try {
      // Extract all matching objects/arrays
      const extractions = SmartExtractor.extractAll(fullText, parent_key);

      // Process each extraction
      const newValues = extractions.map(ext => {
        const data = ext.processed;
        const found = findArrayOfObjects(data, "");
        const array = found.array;

        for (const obj of array) {
          obj[key] = parsedValue;
        }

        return reconstructJSON(data, array, found.isRoot, found.parentKey, formatPref);
      });

      // If only one extraction, return it directly
      if (extractions.length === 1) {
        const arrayLength = JSON.parse(newValues[0]).length || JSON.parse(newValues[0])[Object.keys(JSON.parse(newValues[0]))[0]].length;
        return new ReturnObject({
          status: "success",
          message: `Added '${key}' to ${arrayLength} objects.`,
          payload: newValues[0]
        });
      }

      // Reconstruct text with all updates
      const result = SmartExtractor.reconstructAll(fullText, extractions, newValues.map(v => JSON.parse(v)), formatPref);

      return new ReturnObject({
        status: "success",
        message: `Added '${key}' to objects in ${extractions.length} arrays.`,
        payload: result
      });
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };

  // Command: json_remove_key
  const json_remove_key = new Command({
    name: "json_remove_key",
    parameters: [
      new Parameter({type: "string", name: "key", helpText: "Key to remove", default: ""}),
      new Parameter({type: "string", name: "parent_key", helpText: "Parent key containing the array (optional)", default: ""})
    ],
    type: "replaceAll",
    helpText: "Remove a key from all objects in array.",
    tutorials: [
      new TutorialCommand({command: "json_remove_key('temp_id')", description: "Remove temp_id from all objects"}),
      new TutorialCommand({command: "json_remove_key('password', 'users')", description: "Remove password from users array"})
    ],
    extension: extensionRoot
  });

  json_remove_key.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const key = params[0];
    const parent_key = params[1] || "";

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

        let count = 0;
        for (const obj of array) {
          if (obj.hasOwnProperty(key)) {
            delete obj[key];
            count++;
          }
        }

        return {
          value: reconstructJSON(data, array, found.isRoot, found.parentKey, formatPref),
          count
        };
      });

      // If only one extraction, return it directly
      if (extractions.length === 1) {
        return new ReturnObject({
          status: "success",
          message: `Removed '${key}' from ${newValues[0].count} objects.`,
          payload: newValues[0].value
        });
      }

      // Reconstruct text with all updates
      const result = SmartExtractor.reconstructAll(fullText, extractions, newValues.map(v => JSON.parse(v.value)), formatPref);
      const totalCount = newValues.reduce((sum, v) => sum + v.count, 0);

      return new ReturnObject({
        status: "success",
        message: `Removed '${key}' from ${totalCount} objects across ${extractions.length} arrays.`,
        payload: result
      });
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };

  // Command: json_set_key
  const json_set_key = new Command({
    name: "json_set_key",
    parameters: [
      new Parameter({type: "string", name: "key", helpText: "Key to set", default: ""}),
      new Parameter({type: "string", name: "value", helpText: "New value for the key", default: ""}),
      new Parameter({type: "string", name: "parent_key", helpText: "Parent key containing the array (optional)", default: ""})
    ],
    type: "replaceAll",
    helpText: "Set a key to a specific value in all objects.",
    tutorials: [
      new TutorialCommand({command: "json_set_key('verified', 'true')", description: "Set verified=true for all objects"}),
      new TutorialCommand({command: "json_set_key('count', '0')", description: "Reset count to 0 for all objects"}),
      new TutorialCommand({command: "json_set_key('active', 'false', 'accounts')", description: "Set active=false in accounts array"})
    ],
    extension: extensionRoot
  });

  json_set_key.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const key = params[0];
    const value = params[1];
    const parent_key = params[2] || "";

    if (!key) {
      return new ReturnObject({status: "error", message: "Key parameter is required.", payload: ""});
    }

    const formatPref = Formatters.getFormatPreference();
    const fullText = payload.fullText || "";
    const parsedValue = parseValue(value);

    try {
      // Extract all matching objects/arrays
      const extractions = SmartExtractor.extractAll(fullText, parent_key);

      // Process each extraction
      const newValues = extractions.map(ext => {
        const data = ext.processed;
        const found = findArrayOfObjects(data, "");
        const array = found.array;

        for (const obj of array) {
          obj[key] = parsedValue;
        }

        return reconstructJSON(data, array, found.isRoot, found.parentKey, formatPref);
      });

      // If only one extraction, return it directly
      if (extractions.length === 1) {
        const arrayLength = JSON.parse(newValues[0]).length || JSON.parse(newValues[0])[Object.keys(JSON.parse(newValues[0]))[0]].length;
        return new ReturnObject({
          status: "success",
          message: `Set '${key}' to '${value}' in ${arrayLength} objects.`,
          payload: newValues[0]
        });
      }

      // Reconstruct text with all updates
      const result = SmartExtractor.reconstructAll(fullText, extractions, newValues.map(v => JSON.parse(v)), formatPref);

      return new ReturnObject({
        status: "success",
        message: `Set '${key}' to '${value}' in ${extractions.length} arrays.`,
        payload: result
      });
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };

  // Command: json_append_key
  const json_append_key = new Command({
    name: "json_append_key",
    parameters: [
      new Parameter({type: "string", name: "key", helpText: "Key to append to", default: ""}),
      new Parameter({type: "string", name: "value", helpText: "Value to append", default: ""}),
      new Parameter({type: "string", name: "parent_key", helpText: "Parent key containing the array (optional)", default: ""})
    ],
    type: "replaceAll",
    helpText: "Append value to the end of existing key values.",
    tutorials: [
      new TutorialCommand({command: "json_append_key('name', ' Jr.')", description: "Append ' Jr.' to all names"}),
      new TutorialCommand({command: "json_append_key('url', '.com')", description: "Append .com to all URLs"}),
      new TutorialCommand({command: "json_append_key('title', ' (archived)', 'posts')", description: "Append ' (archived)' to post titles"})
    ],
    extension: extensionRoot
  });

  json_append_key.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const key = params[0];
    const value = params[1];
    const parent_key = params[2] || "";

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

        let count = 0;
        for (const obj of array) {
          if (obj.hasOwnProperty(key)) {
            obj[key] = String(obj[key]) + value;
            count++;
          }
        }

        return {
          value: reconstructJSON(data, array, found.isRoot, found.parentKey, formatPref),
          count
        };
      });

      // If only one extraction, return it directly
      if (extractions.length === 1) {
        return new ReturnObject({
          status: "success",
          message: `Appended to '${key}' in ${newValues[0].count} objects.`,
          payload: newValues[0].value
        });
      }

      // Reconstruct text with all updates
      const result = SmartExtractor.reconstructAll(fullText, extractions, newValues.map(v => JSON.parse(v.value)), formatPref);
      const totalCount = newValues.reduce((sum, v) => sum + v.count, 0);

      return new ReturnObject({
        status: "success",
        message: `Appended to '${key}' in ${totalCount} objects across ${extractions.length} arrays.`,
        payload: result
      });
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };

  // Command: json_prepend_key
  const json_prepend_key = new Command({
    name: "json_prepend_key",
    parameters: [
      new Parameter({type: "string", name: "key", helpText: "Key to prepend to", default: ""}),
      new Parameter({type: "string", name: "value", helpText: "Value to prepend", default: ""}),
      new Parameter({type: "string", name: "parent_key", helpText: "Parent key containing the array (optional)", default: ""})
    ],
    type: "replaceAll",
    helpText: "Prepend value to the beginning of existing key values.",
    tutorials: [
      new TutorialCommand({command: "json_prepend_key('name', 'Dr. ')", description: "Prepend 'Dr. ' to all names"}),
      new TutorialCommand({command: "json_prepend_key('url', 'https://')", description: "Prepend https:// to all URLs"}),
      new TutorialCommand({command: "json_prepend_key('id', 'USER_', 'accounts')", description: "Prepend 'USER_' to account IDs"})
    ],
    extension: extensionRoot
  });

  json_prepend_key.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const key = params[0];
    const value = params[1];
    const parent_key = params[2] || "";

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

        let count = 0;
        for (const obj of array) {
          if (obj.hasOwnProperty(key)) {
            obj[key] = value + String(obj[key]);
            count++;
          }
        }

        return {
          value: reconstructJSON(data, array, found.isRoot, found.parentKey, formatPref),
          count
        };
      });

      // If only one extraction, return it directly
      if (extractions.length === 1) {
        return new ReturnObject({
          status: "success",
          message: `Prepended to '${key}' in ${newValues[0].count} objects.`,
          payload: newValues[0].value
        });
      }

      // Reconstruct text with all updates
      const result = SmartExtractor.reconstructAll(fullText, extractions, newValues.map(v => JSON.parse(v.value)), formatPref);
      const totalCount = newValues.reduce((sum, v) => sum + v.count, 0);

      return new ReturnObject({
        status: "success",
        message: `Prepended to '${key}' in ${totalCount} objects across ${extractions.length} arrays.`,
        payload: result
      });
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };
})();
