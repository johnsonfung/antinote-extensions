// ===============================
// Antinote Extension: json_tools
// Version 1.0.0
// ===============================

(function () {
  const extensionName = "json_tools";

  const extensionRoot = new Extension({
    name: extensionName,
    version: "1.0.0",
    endpoints: [],
    requiredAPIKeys: [],
    author: "johnsonfung",
    category: "Data Tools",
    dataScope: "full"
  });

  // --- Preferences ---

  const formatPref = new Preference({
    key: "format_style",
    label: "JSON Formatting Style",
    type: "selectOne",
    defaultValue: "pretty",
    options: ["pretty", "compact", "minified"],
    helpText: "Default formatting for JSON output: pretty (2-space indent), compact (no indent), or minified (no whitespace)"
  });
  extensionRoot.register_preference(formatPref);

  // --- Helper Functions ---

  // Convert string to different casing styles
  const convertCasing = (str, casing) => {
    // First normalize the string - split on spaces, underscores, hyphens, and camelCase
    const words = str
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Split camelCase
      .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
      .split(/\s+/) // Split on whitespace
      .filter(w => w.length > 0);

    switch (casing) {
      case 'snake_case':
        return words.map(w => w.toLowerCase()).join('_');
      case 'camelCase':
        return words.map((w, i) =>
          i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        ).join('');
      case 'PascalCase':
        return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
      case 'kebab-case':
        return words.map(w => w.toLowerCase()).join('-');
      case 'UPPER_CASE':
        return words.map(w => w.toUpperCase()).join('_');
      case 'lowercase':
        return words.map(w => w.toLowerCase()).join('');
      default:
        return str;
    }
  };

  // Parse loose JSON/JS - supports single quotes, trailing commas, comments, unquoted keys
  const parseLooseJSON = (text) => {
    // Remove comments
    const cleaned = text
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
      .replace(/\/\/.*/g, ''); // Remove // comments

    // Try standard JSON.parse first
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      // Try to fix common issues
      try {
        const fixed = cleaned
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":') // Quote unquoted keys
          .replace(/'/g, '"'); // Replace single quotes with double quotes

        return JSON.parse(fixed);
      } catch (e2) {
        throw new Error(`Invalid JSON: ${e2.message}`);
      }
    }
  };

  // Find array of objects in parsed data
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

  // Parse CSV with proper escaping and quote handling
  const parseCSV = (text) => {
    const lines = [];
    let currentLine = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;

    while (i < text.length) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (inQuotes) {
        if (char === '"') {
          if (nextChar === '"') {
            // Escaped quote
            currentField += '"';
            i += 2;
            continue;
          } else {
            // End of quoted field
            inQuotes = false;
            i++;
            continue;
          }
        } else {
          currentField += char;
          i++;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
          i++;
        } else if (char === ',') {
          currentLine.push(currentField);
          currentField = '';
          i++;
        } else if (char === '\n' || char === '\r') {
          if (currentField || currentLine.length > 0) {
            currentLine.push(currentField);
            lines.push(currentLine);
            currentLine = [];
            currentField = '';
          }
          // Handle \r\n
          if (char === '\r' && nextChar === '\n') {
            i++;
          }
          i++;
        } else {
          currentField += char;
          i++;
        }
      }
    }

    // Add last field and line if any
    if (currentField || currentLine.length > 0) {
      currentLine.push(currentField);
      lines.push(currentLine);
    }

    return lines;
  };

  // Escape string for JSON
  const escapeForJSON = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  };

  // Compare operator
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

  // Deep equality check for objects
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

  // Reconstruct JSON maintaining original formatting where possible
  const reconstructJSON = (originalText, data, result, isRoot, parentKey) => {
    if (isRoot) {
      // Root is the array, just return the result
      return JSON.stringify(result, null, 2);
    } else {
      // Need to update nested property
      data[parentKey] = result;
      return JSON.stringify(data, null, 2);
    }
  };

  // --- Command: csv_to_json ---
  const csv_to_json = new Command({
    name: "csv_to_json",
    parameters: [],
    type: "replaceAll",
    helpText: "Convert CSV to JSON array of objects using first row as keys.",
    tutorials: [
      new TutorialCommand({command: "csv_to_json", description: "Convert CSV with headers to JSON array"})
    ],
    extension: extensionRoot
  });

  csv_to_json.execute = function (payload) {
    const casing = getExtensionPreference(extensionName, "key_casing") || "snake_case";

    try {
      const lines = parseCSV(payload.fullText);

      if (lines.length < 2) {
        return new ReturnObject({status: "error", message: "CSV must have at least a header row and one data row.", payload: ""});
      }

      const headers = lines[0].map(header => convertCasing(header.trim(), casing));

      const result = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i];
        if (row.length === 0 || (row.length === 1 && row[0] === '')) {
          continue; // Skip empty lines
        }

        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          const value = row[j] || '';
          // Try to parse as number - only if the entire string is a valid number
          const numValue = parseFloat(value);
          const isNumber = !isNaN(numValue) && value !== '' && String(numValue) === value.trim();
          obj[headers[j]] = isNumber ? numValue : value;
        }
        result.push(obj);
      }

      const output = JSON.stringify(result, null, 2);
      return new ReturnObject({status: "success", message: `Converted CSV to JSON (${result.length} objects).`, payload: output});
    } catch (e) {
      return new ReturnObject({status: "error", message: `Invalid CSV: ${e.message}`, payload: ""});
    }
  };

  // --- Command: json_sort ---
  const json_sort = new Command({
    name: "json_sort",
    parameters: [
      new Parameter({type: "string", name: "key", helpText: "Key to sort by", default: ""}),
      new Parameter({type: "bool", name: "reverse", helpText: "Sort in reverse order", default: false}),
      new Parameter({type: "string", name: "parentKey", helpText: "Parent key containing the array (optional)", default: ""})
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
    const parentKey = params[2] || "";

    if (!key) {
      return new ReturnObject({status: "error", message: "Key parameter is required.", payload: ""});
    }

    try {
      const data = parseLooseJSON(payload.fullText);
      const found = findArrayOfObjects(data, parentKey);
      const array = found.array;

      // Check if key exists in objects
      const hasKey = array.some(obj => obj.hasOwnProperty(key));

      if (!hasKey) {
        return new ReturnObject({status: "error", message: `Key '${key}' not found in array objects.`, payload: ""});
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

      const output = reconstructJSON(payload.fullText, data, array, found.isRoot, found.parentKey);
      return new ReturnObject({status: "success", message: `Sorted array by '${key}'.`, payload: output});
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };

  // --- Command: json_filter ---
  const json_filter = new Command({
    name: "json_filter",
    parameters: [
      new Parameter({type: "string", name: "key", helpText: "Key to filter by", default: ""}),
      new Parameter({type: "string", name: "operator", helpText: "Comparison operator (=, !=, >, <, >=, <=, contains, startsWith, endsWith)", default: "="}),
      new Parameter({type: "string", name: "value", helpText: "Value to compare against", default: ""}),
      new Parameter({type: "string", name: "parentKey", helpText: "Parent key containing the array (optional)", default: ""})
    ],
    type: "replaceAll",
    helpText: "Filter array of objects keeping only items matching criteria.",
    tutorials: [
      new TutorialCommand({command: "json_filter('status', '=', 'active')", description: "Keep only active items"}),
      new TutorialCommand({command: "json_filter('age', '>', '18')", description: "Keep items where age > 18"}),
      new TutorialCommand({command: "json_filter('name', 'contains', 'John')", description: "Keep items where name contains John"})
    ],
    extension: extensionRoot
  });

  json_filter.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const key = params[0];
    const operator = params[1] || "=";
    const value = params[2];
    const parentKey = params[3] || "";

    if (!key) {
      return new ReturnObject({status: "error", message: "Key parameter is required.", payload: ""});
    }

    try {
      const data = parseLooseJSON(payload.fullText);
      const found = findArrayOfObjects(data, parentKey);
      const array = found.array;

      const filtered = array.filter(obj =>
        obj.hasOwnProperty(key) && compareValues(obj[key], value, operator)
      );

      const output = reconstructJSON(payload.fullText, data, filtered, found.isRoot, found.parentKey);
      return new ReturnObject({status: "success", message: `Filtered to ${filtered.length} items (from ${array.length}).`, payload: output});
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };

  // --- Command: json_filter_out ---
  const json_filter_out = new Command({
    name: "json_filter_out",
    parameters: [
      new Parameter({type: "string", name: "key", helpText: "Key to filter by", default: ""}),
      new Parameter({type: "string", name: "operator", helpText: "Comparison operator", default: "="}),
      new Parameter({type: "string", name: "value", helpText: "Value to compare against", default: ""}),
      new Parameter({type: "string", name: "parentKey", helpText: "Parent key containing the array (optional)", default: ""})
    ],
    type: "replaceAll",
    helpText: "Filter array of objects removing items matching criteria.",
    tutorials: [
      new TutorialCommand({command: "json_filter_out('status', '=', 'deleted')", description: "Remove deleted items"}),
      new TutorialCommand({command: "json_filter_out('age', '<', '18')", description: "Remove items where age < 18"})
    ],
    extension: extensionRoot
  });

  json_filter_out.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const key = params[0];
    const operator = params[1] || "=";
    const value = params[2];
    const parentKey = params[3] || "";

    if (!key) {
      return new ReturnObject({status: "error", message: "Key parameter is required.", payload: ""});
    }

    try {
      const data = parseLooseJSON(payload.fullText);
      const found = findArrayOfObjects(data, parentKey);
      const array = found.array;

      const filtered = array.filter(obj =>
        !obj.hasOwnProperty(key) || !compareValues(obj[key], value, operator)
      );

      const output = reconstructJSON(payload.fullText, data, filtered, found.isRoot, found.parentKey);
      return new ReturnObject({status: "success", message: `Removed ${array.length - filtered.length} items, kept ${filtered.length}.`, payload: output});
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };

  // --- Command: json_add_key ---
  const json_add_key = new Command({
    name: "json_add_key",
    parameters: [
      new Parameter({type: "string", name: "key", helpText: "Key to add", default: ""}),
      new Parameter({type: "string", name: "value", helpText: "Value for the key (blank = null)", default: ""}),
      new Parameter({type: "string", name: "parentKey", helpText: "Parent key containing the array (optional)", default: ""})
    ],
    type: "replaceAll",
    helpText: "Add a key-value pair to all objects in array.",
    tutorials: [
      new TutorialCommand({command: "json_add_key('status', 'active')", description: "Add status=active to all objects"}),
      new TutorialCommand({command: "json_add_key('created', '')", description: "Add created=null to all objects"})
    ],
    extension: extensionRoot
  });

  json_add_key.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const key = params[0];
    const value = params[1];
    const parentKey = params[2] || "";

    if (!key) {
      return new ReturnObject({status: "error", message: "Key parameter is required.", payload: ""});
    }

    try {
      const data = parseLooseJSON(payload.fullText);
      const found = findArrayOfObjects(data, parentKey);
      const array = found.array;

      // Parse value - try as number, then boolean, then string
      let parsedValue = value;
      if (value === '') {
        parsedValue = null;
      } else if (!isNaN(parseFloat(value)) && isFinite(value)) {
        parsedValue = parseFloat(value);
      } else if (value === 'true') {
        parsedValue = true;
      } else if (value === 'false') {
        parsedValue = false;
      }

      for (const obj of array) {
        obj[key] = parsedValue;
      }

      const output = reconstructJSON(payload.fullText, data, array, found.isRoot, found.parentKey);
      return new ReturnObject({status: "success", message: `Added '${key}' to ${array.length} objects.`, payload: output});
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };

  // --- Command: json_remove_key ---
  const json_remove_key = new Command({
    name: "json_remove_key",
    parameters: [
      new Parameter({type: "string", name: "key", helpText: "Key to remove", default: ""}),
      new Parameter({type: "string", name: "parentKey", helpText: "Parent key containing the array (optional)", default: ""})
    ],
    type: "replaceAll",
    helpText: "Remove a key from all objects in array.",
    tutorials: [
      new TutorialCommand({command: "json_remove_key('temp_id')", description: "Remove temp_id from all objects"})
    ],
    extension: extensionRoot
  });

  json_remove_key.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const key = params[0];
    const parentKey = params[1] || "";

    if (!key) {
      return new ReturnObject({status: "error", message: "Key parameter is required.", payload: ""});
    }

    try {
      const data = parseLooseJSON(payload.fullText);
      const found = findArrayOfObjects(data, parentKey);
      const array = found.array;

      let count = 0;
      for (const obj of array) {
        if (obj.hasOwnProperty(key)) {
          delete obj[key];
          count++;
        }
      }

      const output = reconstructJSON(payload.fullText, data, array, found.isRoot, found.parentKey);
      return new ReturnObject({status: "success", message: `Removed '${key}' from ${count} objects.`, payload: output});
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };

  // --- Command: json_set_key ---
  const json_set_key = new Command({
    name: "json_set_key",
    parameters: [
      new Parameter({type: "string", name: "key", helpText: "Key to set", default: ""}),
      new Parameter({type: "string", name: "value", helpText: "New value for the key", default: ""}),
      new Parameter({type: "string", name: "parentKey", helpText: "Parent key containing the array (optional)", default: ""})
    ],
    type: "replaceAll",
    helpText: "Set a key to a specific value in all objects.",
    tutorials: [
      new TutorialCommand({command: "json_set_key('verified', 'true')", description: "Set verified=true for all objects"}),
      new TutorialCommand({command: "json_set_key('count', '0')", description: "Reset count to 0 for all objects"})
    ],
    extension: extensionRoot
  });

  json_set_key.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const key = params[0];
    const value = params[1];
    const parentKey = params[2] || "";

    if (!key) {
      return new ReturnObject({status: "error", message: "Key parameter is required.", payload: ""});
    }

    try {
      const data = parseLooseJSON(payload.fullText);
      const found = findArrayOfObjects(data, parentKey);
      const array = found.array;

      // Parse value
      let parsedValue = value;
      if (value === '') {
        parsedValue = null;
      } else if (!isNaN(parseFloat(value)) && isFinite(value)) {
        parsedValue = parseFloat(value);
      } else if (value === 'true') {
        parsedValue = true;
      } else if (value === 'false') {
        parsedValue = false;
      }

      for (const obj of array) {
        obj[key] = parsedValue;
      }

      const output = reconstructJSON(payload.fullText, data, array, found.isRoot, found.parentKey);
      return new ReturnObject({status: "success", message: `Set '${key}' to '${value}' in ${array.length} objects.`, payload: output});
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };

  // --- Command: json_append_key ---
  const json_append_key = new Command({
    name: "json_append_key",
    parameters: [
      new Parameter({type: "string", name: "key", helpText: "Key to append to", default: ""}),
      new Parameter({type: "string", name: "value", helpText: "Value to append", default: ""}),
      new Parameter({type: "string", name: "parentKey", helpText: "Parent key containing the array (optional)", default: ""})
    ],
    type: "replaceAll",
    helpText: "Append value to the end of existing key values.",
    tutorials: [
      new TutorialCommand({command: "json_append_key('name', ' Jr.')", description: "Append ' Jr.' to all names"}),
      new TutorialCommand({command: "json_append_key('url', '.com')", description: "Append .com to all URLs"})
    ],
    extension: extensionRoot
  });

  json_append_key.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const key = params[0];
    const value = params[1];
    const parentKey = params[2] || "";

    if (!key) {
      return new ReturnObject({status: "error", message: "Key parameter is required.", payload: ""});
    }

    try {
      const data = parseLooseJSON(payload.fullText);
      const found = findArrayOfObjects(data, parentKey);
      const array = found.array;

      let count = 0;
      for (const obj of array) {
        if (obj.hasOwnProperty(key)) {
          obj[key] = String(obj[key]) + value;
          count++;
        }
      }

      const output = reconstructJSON(payload.fullText, data, array, found.isRoot, found.parentKey);
      return new ReturnObject({status: "success", message: `Appended to '${key}' in ${count} objects.`, payload: output});
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };

  // --- Command: json_prepend_key ---
  const json_prepend_key = new Command({
    name: "json_prepend_key",
    parameters: [
      new Parameter({type: "string", name: "key", helpText: "Key to prepend to", default: ""}),
      new Parameter({type: "string", name: "value", helpText: "Value to prepend", default: ""}),
      new Parameter({type: "string", name: "parentKey", helpText: "Parent key containing the array (optional)", default: ""})
    ],
    type: "replaceAll",
    helpText: "Prepend value to the beginning of existing key values.",
    tutorials: [
      new TutorialCommand({command: "json_prepend_key('name', 'Dr. ')", description: "Prepend 'Dr. ' to all names"}),
      new TutorialCommand({command: "json_prepend_key('url', 'https://')", description: "Prepend https:// to all URLs"})
    ],
    extension: extensionRoot
  });

  json_prepend_key.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const key = params[0];
    const value = params[1];
    const parentKey = params[2] || "";

    if (!key) {
      return new ReturnObject({status: "error", message: "Key parameter is required.", payload: ""});
    }

    try {
      const data = parseLooseJSON(payload.fullText);
      const found = findArrayOfObjects(data, parentKey);
      const array = found.array;

      let count = 0;
      for (const obj of array) {
        if (obj.hasOwnProperty(key)) {
          obj[key] = value + String(obj[key]);
          count++;
        }
      }

      const output = reconstructJSON(payload.fullText, data, array, found.isRoot, found.parentKey);
      return new ReturnObject({status: "success", message: `Prepended to '${key}' in ${count} objects.`, payload: output});
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };

  // --- Command: json_get_dupes ---
  const json_get_dupes = new Command({
    name: "json_get_dupes",
    parameters: [
      new Parameter({type: "string", name: "key", helpText: "Key to check for duplicates (leave empty for primitive arrays)", default: ""}),
      new Parameter({type: "string", name: "parentKey", helpText: "Parent key containing the array (optional)", default: ""})
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
    let parentKey = params[1] || "";

    try {
      const data = parseLooseJSON(payload.fullText);
      let array;
      let isRoot = false;
      let isPrimitiveArray = false;

      // Find array - try parentKey first, then look for array
      if (parentKey) {
        if (data?.[parentKey]) {
          if (Array.isArray(data[parentKey])) {
            array = data[parentKey];
          } else {
            return new ReturnObject({status: "error", message: `Key '${parentKey}' does not contain an array.`, payload: ""});
          }
        } else {
          return new ReturnObject({status: "error", message: `Could not find key '${parentKey}'.`, payload: ""});
        }
      } else {
        if (Array.isArray(data)) {
          array = data;
          isRoot = true;
        } else {
          // Try to find first array
          let foundArray = false;
          for (const k in data) {
            if (data.hasOwnProperty(k) && Array.isArray(data[k])) {
              array = data[k];
              parentKey = k;
              foundArray = true;
              break;
            }
          }
          if (!foundArray) {
            return new ReturnObject({status: "error", message: "Could not find an array in the document.", payload: ""});
          }
        }
      }

      // Check if it's a primitive array or array of objects
      if (array.length > 0 && (typeof array[0] !== 'object' || array[0] === null)) {
        isPrimitiveArray = true;
      }

      // Handle primitive arrays
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
        const dupeGroups = [];
        for (const val in groups) {
          if (groups.hasOwnProperty(val) && groups[val].length > 1) {
            dupeGroups.push({ value: val, count: groups[val].length });
          }
        }

        if (dupeGroups.length === 0) {
          return new ReturnObject({status: "success", message: "No duplicate values found.", payload: "# No Duplicates Found"});
        }

        // Build output for primitives
        let output = "# Duplicates Found\n\n";
        for (let i = 0; i < dupeGroups.length; i++) {
          const group = dupeGroups[i];
          output += `# Duplicate group ${i + 1} (${group.count} occurrences)\n`;
          output += `${group.value}\n\n`;
        }

        return new ReturnObject({status: "success", message: `Found ${dupeGroups.length} duplicate value groups.`, payload: output});
      }

      // Handle array of objects with key
      if (!key) {
        return new ReturnObject({status: "error", message: "Key parameter is required for arrays of objects.", payload: ""});
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
      const dupeGroups = [];
      for (const keyVal in groups) {
        if (groups.hasOwnProperty(keyVal) && groups[keyVal].length > 1) {
          dupeGroups.push({ key: keyVal, objects: groups[keyVal] });
        }
      }

      if (dupeGroups.length === 0) {
        return new ReturnObject({status: "success", message: `No duplicates found for key '${key}'.`, payload: "# No Duplicates Found"});
      }

      // Build output for objects
      let output = "# Duplicates Found\n\n";
      for (let i = 0; i < dupeGroups.length; i++) {
        const group = dupeGroups[i];
        output += `# Duplicate group ${i + 1} (${key}="${group.key}")\n`;
        for (const obj of group.objects) {
          output += JSON.stringify(obj, null, 2) + "\n";
        }
        output += "\n";
      }

      return new ReturnObject({status: "success", message: `Found ${dupeGroups.length} duplicate groups.`, payload: output});
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };

  // --- Command: json_dedupe ---
  const json_dedupe = new Command({
    name: "json_dedupe",
    parameters: [
      new Parameter({type: "bool", name: "keepFirst", helpText: "Keep first occurrence (true) or last (false)", default: true}),
      new Parameter({type: "string", name: "parentKey", helpText: "Parent key containing the array (optional)", default: ""})
    ],
    type: "replaceAll",
    helpText: "Remove exact duplicate objects from array.",
    tutorials: [
      new TutorialCommand({command: "json_dedupe", description: "Remove duplicates, keeping first occurrence"}),
      new TutorialCommand({command: "json_dedupe(false)", description: "Remove duplicates, keeping last occurrence"})
    ],
    extension: extensionRoot
  });

  json_dedupe.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const keepFirst = params[0];
    const parentKey = params[1] || "";

    try {
      const data = parseLooseJSON(payload.fullText);
      const found = findArrayOfObjects(data, parentKey);
      const array = found.array;

      const seen = [];
      const unique = [];

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

      const output = reconstructJSON(payload.fullText, data, unique, found.isRoot, found.parentKey);
      return new ReturnObject({status: "success", message: `Removed ${array.length - unique.length} duplicates, kept ${unique.length} unique objects.`, payload: output});
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };

  // --- Command: json_sort_array ---
  const json_sort_array = new Command({
    name: "json_sort_array",
    parameters: [
      new Parameter({type: "bool", name: "reverse", helpText: "Sort in reverse order", default: false}),
      new Parameter({type: "string", name: "parentKey", helpText: "Parent key containing the array (optional)", default: ""})
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
    let parentKey = params[1] || "";

    try {
      const data = parseLooseJSON(payload.fullText);
      let array;
      let isRoot = false;

      if (parentKey) {
        if (data?.[parentKey]) {
          if (Array.isArray(data[parentKey])) {
            array = data[parentKey];
          } else {
            return new ReturnObject({status: "error", message: `Key '${parentKey}' does not contain an array.`, payload: ""});
          }
        } else {
          return new ReturnObject({status: "error", message: `Could not find key '${parentKey}'.`, payload: ""});
        }
      } else {
        if (Array.isArray(data)) {
          array = data;
          isRoot = true;
        } else {
          // Try to find first array
          let foundArray = false;
          for (const key in data) {
            if (data.hasOwnProperty(key) && Array.isArray(data[key])) {
              array = data[key];
              parentKey = key;
              foundArray = true;
              break;
            }
          }
          if (!foundArray) {
            return new ReturnObject({status: "error", message: "Could not find an array in the document.", payload: ""});
          }
        }
      }

      // Check if array contains primitives
      for (const item of array) {
        if (typeof item === 'object' && item !== null) {
          return new ReturnObject({status: "error", message: "Array contains objects. Use json_sort for arrays of objects.", payload: ""});
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

      const output = isRoot ? JSON.stringify(array, null, 2) : JSON.stringify(data, null, 2);
      return new ReturnObject({status: "success", message: `Sorted array of ${array.length} items.`, payload: output});
    } catch (e) {
      return new ReturnObject({status: "error", message: e.message, payload: ""});
    }
  };
})();
