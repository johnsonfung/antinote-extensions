// JSON duplicate detection and removal commands

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["json_tools"];
  const SmartExtractor = ctx.shared.SmartExtractor;
  const Formatters = ctx.shared.Formatters;
  const extensionRoot = ctx.root;

  // Helper: Deep equality check for objects
  const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
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

  // Command: json_get_dupes
  const json_get_dupes = new Command({
    name: "json_get_dupes",
    parameters: [
      new Parameter({type: "string", name: "key", helpText: "Key to check for duplicates (leave empty for primitive arrays)", default: ""}),
      new Parameter({type: "string", name: "parent_key", helpText: "Parent key containing the array (optional)", default: ""})
    ],
    type: "insert",
    helpText: "Find and display duplicate objects by key or duplicate primitives.",
    tutorials: [
      new TutorialCommand({command: "json_get_dupes('email')", description: "Find objects with duplicate emails"}),
      new TutorialCommand({command: "json_get_dupes('id', 'users')", description: "Find duplicate IDs in users array"}),
      new TutorialCommand({command: "json_get_dupes", description: "Find duplicate values in primitive array"})
    ],
    extension: extensionRoot
  });

  json_get_dupes.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const key = params[0];
    const parent_key = params[1] || "";

    const formatPref = Formatters.getFormatPreference();
    const fullText = payload.fullText || "";

    try {
      // Extract all matching objects/arrays
      const extractions = SmartExtractor.extractAll(fullText, parent_key);

      let allDupeGroups = [];
      let arrayCount = 0;

      // Process each extraction
      extractions.forEach(ext => {
        let array = ext.processed;
        arrayCount++;

        // If not root array, try to find array in object
        if (!Array.isArray(array)) {
          if (array && typeof array === 'object') {
            // Try to find first array
            let foundArray = false;
            for (const k in array) {
              if (array.hasOwnProperty(k) && Array.isArray(array[k])) {
                array = array[k];
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

        // Check if it's a primitive array or array of objects
        const isPrimitiveArray = array.length > 0 && (typeof array[0] !== 'object' || array[0] === null);

        if (isPrimitiveArray || (!key && array.length > 0)) {
          // Group primitive values
          const groups = {};
          for (const val of array) {
            const valStr = String(val);
            if (!groups[valStr]) {
              groups[valStr] = [];
            }
            groups[valStr].push(val);
          }

          // Find groups with more than one item
          for (const val in groups) {
            if (groups.hasOwnProperty(val) && groups[val].length > 1) {
              allDupeGroups.push({
                value: val,
                count: groups[val].length,
                arrayIndex: arrayCount,
                isPrimitive: true
              });
            }
          }
        } else {
          // Handle array of objects with key
          if (!key) {
            throw new Error("Key parameter is required for arrays of objects.");
          }

          // Group by key value
          const groups = {};
          for (const obj of array) {
            if (obj.hasOwnProperty(key)) {
              const keyVal = String(obj[key]);
              if (!groups[keyVal]) {
                groups[keyVal] = [];
              }
              groups[keyVal].push(obj);
            }
          }

          // Find groups with more than one item
          for (const keyVal in groups) {
            if (groups.hasOwnProperty(keyVal) && groups[keyVal].length > 1) {
              allDupeGroups.push({
                key: keyVal,
                objects: groups[keyVal],
                arrayIndex: arrayCount,
                isPrimitive: false
              });
            }
          }
        }
      });

      if (allDupeGroups.length === 0) {
        return new ReturnObject({
          status: "success",
          message: key ? `No duplicates found for key '${key}'.` : "No duplicate values found.",
          payload: "# No Duplicates Found"
        });
      }

      // Build output
      let output = "# Duplicates Found\n\n";

      if (extractions.length > 1) {
        output += `Found duplicates in ${arrayCount} array(s)\n\n`;
      }

      for (let i = 0; i < allDupeGroups.length; i++) {
        const group = allDupeGroups[i];

        if (extractions.length > 1) {
          output += `## Array ${group.arrayIndex} - `;
        } else {
          output += `## `;
        }

        if (group.isPrimitive) {
          output += `Duplicate group ${i + 1} (${group.count} occurrences)\n`;
          output += `${group.value}\n\n`;
        } else {
          output += `Duplicate group ${i + 1} (${key}="${group.key}")\n`;
          for (const obj of group.objects) {
            output += JSON.stringify(obj, null, 2) + "\n";
          }
          output += "\n";
        }
      }

      return new ReturnObject({
        status: "success",
        message: `Found ${allDupeGroups.length} duplicate groups.`,
        payload: output
      });
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };

  // Command: json_dedupe
  const json_dedupe = new Command({
    name: "json_dedupe",
    parameters: [
      new Parameter({type: "bool", name: "keepFirst", helpText: "Keep first occurrence (true) or last (false)", default: true}),
      new Parameter({type: "string", name: "parent_key", helpText: "Parent key containing the array (optional)", default: ""})
    ],
    type: "replaceAll",
    helpText: "Remove exact duplicate objects from array.",
    tutorials: [
      new TutorialCommand({command: "json_dedupe", description: "Remove duplicates, keeping first occurrence"}),
      new TutorialCommand({command: "json_dedupe(false)", description: "Remove duplicates, keeping last occurrence"}),
      new TutorialCommand({command: "json_dedupe(true, 'items')", description: "Dedupe items array, keeping first"})
    ],
    extension: extensionRoot
  });

  json_dedupe.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const keepFirst = params[0];
    const parent_key = params[1] || "";

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

        const seen = [];
        const unique = [];
        const originalLength = array.length;

        if (keepFirst) {
          for (const item of array) {
            const isDupe = seen.some(s => deepEqual(item, s));
            if (!isDupe) {
              seen.push(item);
              unique.push(item);
            }
          }
        } else {
          // Keep last - process in reverse
          for (let i = array.length - 1; i >= 0; i--) {
            const item = array[i];
            const isDupe = seen.some(s => deepEqual(item, s));
            if (!isDupe) {
              seen.push(item);
              unique.unshift(item); // Add to beginning to maintain order
            }
          }
        }

        return {
          value: reconstructJSON(data, unique, found.isRoot, found.parentKey, formatPref),
          originalLength,
          uniqueLength: unique.length,
          removedCount: originalLength - unique.length
        };
      });

      // If only one extraction, return it directly
      if (extractions.length === 1) {
        const result = newValues[0];
        return new ReturnObject({
          status: "success",
          message: `Removed ${result.removedCount} duplicates, kept ${result.uniqueLength} unique objects.`,
          payload: result.value
        });
      }

      // Reconstruct text with all updates
      const result = SmartExtractor.reconstructAll(fullText, extractions, newValues.map(v => JSON.parse(v.value)), formatPref);
      const totalRemoved = newValues.reduce((sum, v) => sum + v.removedCount, 0);
      const totalUnique = newValues.reduce((sum, v) => sum + v.uniqueLength, 0);

      return new ReturnObject({
        status: "success",
        message: `Removed ${totalRemoved} duplicates from ${extractions.length} arrays, kept ${totalUnique} unique objects.`,
        payload: result
      });
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };
})();
