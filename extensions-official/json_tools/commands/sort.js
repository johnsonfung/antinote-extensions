// JSON sorting commands

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

  // Command: json_sort
  const json_sort = new Command({
    name: "json_sort",
    parameters: [
      new Parameter({type: "string", name: "key", helpText: "Key to sort by", default: "name", required: true}),
      new Parameter({type: "bool", name: "reverse", helpText: "Sort in reverse order", default: false, required: false}),
      new Parameter({type: "string", name: "parent_key", helpText: "Parent key containing the array (optional)", default: "", required: false})
    ],
    type: "replaceAll",
    helpText: "Sort array of objects by a key value.",
    tutorials: [
      new TutorialCommand({command: "json_sort('name')", description: "Sort by name field"}),
      new TutorialCommand({command: "json_sort('age', true)", description: "Sort by age in descending order"}),
      new TutorialCommand({command: "json_sort('id', false, 'users')", description: "Sort users array by id"})
    ],
    extension: extensionRoot
  });

  json_sort.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const key = params[0];
    const reverse = params[1];
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

        // Check if key exists in objects
        const hasKey = array.some(obj => obj.hasOwnProperty(key));

        if (!hasKey) {
          throw new Error(`Key '${key}' not found in array objects.`);
        }

        // Sort the array
        array.sort((a, b) => {
          const aVal = a[key];
          const bVal = b[key];

          // Handle null/undefined
          if (aVal == null && bVal == null) return 0;
          if (aVal == null) return 1;
          if (bVal == null) return -1;

          // Numeric comparison if both are numbers
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return reverse ? bVal - aVal : aVal - bVal;
          }

          // String comparison
          const aStr = String(aVal);
          const bStr = String(bVal);
          if (aStr < bStr) return reverse ? 1 : -1;
          if (aStr > bStr) return reverse ? -1 : 1;
          return 0;
        });

        return reconstructJSON(data, array, found.isRoot, found.parentKey, formatPref);
      });

      // If only one extraction, return it directly
      if (extractions.length === 1) {
        return new ReturnObject({status: "success", message: `Sorted array by '${key}'.`, payload: newValues[0]});
      }

      // Reconstruct text with all updates
      const result = SmartExtractor.reconstructAll(fullText, extractions, newValues.map(v => JSON.parse(v)), formatPref);

      return new ReturnObject({status: "success", message: `Sorted ${extractions.length} arrays by '${key}'.`, payload: result});
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };

  // Command: json_sort_array
  const json_sort_array = new Command({
    name: "json_sort_array",
    parameters: [
      new Parameter({type: "bool", name: "reverse", helpText: "Sort in reverse order", default: false, required: false}),
      new Parameter({type: "string", name: "parent_key", helpText: "Parent key containing the array (optional)", default: "", required: false})
    ],
    type: "replaceAll",
    helpText: "Sort an array of primitive values (strings/numbers).",
    tutorials: [
      new TutorialCommand({command: "json_sort_array", description: "Sort array of primitives"}),
      new TutorialCommand({command: "json_sort_array(true)", description: "Sort in descending order"}),
      new TutorialCommand({command: "json_sort_array(false, 'tags')", description: "Sort tags array"})
    ],
    extension: extensionRoot
  });

  json_sort_array.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const reverse = params[0];
    const parent_key = params[1] || "";

    const formatPref = Formatters.getFormatPreference();
    const fullText = payload.fullText || "";

    try {
      // Extract all matching objects/arrays
      const extractions = SmartExtractor.extractAll(fullText, parent_key);

      // Process each extraction
      const newValues = extractions.map(ext => {
        let array = ext.processed;

        // If not root array, try to find array in object
        if (!Array.isArray(array)) {
          if (array && typeof array === 'object') {
            // Try to find first array
            let foundArray = false;
            for (const key in array) {
              if (array.hasOwnProperty(key) && Array.isArray(array[key])) {
                array = array[key];
                foundArray = true;
                break;
              }
            }
            if (!foundArray) {
              throw new Error("Could not find an array in the document.");
            }
          } else {
            throw new Error("Could not find an array in the document.");
          }
        }

        // Check if array contains primitives
        for (const item of array) {
          if (typeof item === 'object' && item !== null) {
            throw new Error("Array contains objects. Use json_sort for arrays of objects.");
          }
        }

        // Sort the array
        array.sort((a, b) => {
          // Numeric comparison if both are numbers
          if (typeof a === 'number' && typeof b === 'number') {
            return reverse ? b - a : a - b;
          }

          // String comparison
          const aStr = String(a);
          const bStr = String(b);
          if (aStr < bStr) return reverse ? 1 : -1;
          if (aStr > bStr) return reverse ? -1 : 1;
          return 0;
        });

        return array;
      });

      // If only one extraction, return it directly
      if (extractions.length === 1) {
        const output = SmartExtractor.format(newValues[0], formatPref);
        return new ReturnObject({status: "success", message: `Sorted array of ${newValues[0].length} items.`, payload: output});
      }

      // Reconstruct text with all updates
      const result = SmartExtractor.reconstructAll(fullText, extractions, newValues, formatPref);

      return new ReturnObject({status: "success", message: `Sorted ${extractions.length} arrays.`, payload: result});
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };
})();
