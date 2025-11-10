// ===============================
// Antinote Extension: json_tools
// Version 1.0.0
// ===============================

(function () {
  var extensionName = "json_tools";

  var extensionRoot = new Extension(
    extensionName,
    "1.0.0",
    [],
    [],
    "johnsonfung",
    "Data Tools",
    "full"
  );

  // --- Helper Functions ---

  // Convert string to different casing styles
  function convertCasing(str, casing) {
    // First normalize the string - split on spaces, underscores, hyphens, and camelCase
    var words = str
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Split camelCase
      .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
      .split(/\s+/) // Split on whitespace
      .filter(function(w) { return w.length > 0; });

    switch (casing) {
      case 'snake_case':
        return words.map(function(w) { return w.toLowerCase(); }).join('_');
      case 'camelCase':
        return words.map(function(w, i) {
          return i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        }).join('');
      case 'PascalCase':
        return words.map(function(w) {
          return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        }).join('');
      case 'kebab-case':
        return words.map(function(w) { return w.toLowerCase(); }).join('-');
      case 'UPPER_CASE':
        return words.map(function(w) { return w.toUpperCase(); }).join('_');
      case 'lowercase':
        return words.map(function(w) { return w.toLowerCase(); }).join('');
      default:
        return str;
    }
  }

  // Parse loose JSON/JS - supports single quotes, trailing commas, comments, unquoted keys
  function parseLooseJSON(text) {
    // Remove comments
    var cleaned = text
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
      .replace(/\/\/.*/g, ''); // Remove // comments

    // Try standard JSON.parse first
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      // Try to fix common issues
      try {
        var fixed = cleaned
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":') // Quote unquoted keys
          .replace(/'/g, '"'); // Replace single quotes with double quotes

        return JSON.parse(fixed);
      } catch (e2) {
        throw new Error("Invalid JSON: " + e2.message);
      }
    }
  }

  // Find array of objects in parsed data
  function findArrayOfObjects(data, parentKey) {
    if (parentKey) {
      // Look for specific key
      if (data && typeof data === 'object' && data[parentKey]) {
        if (Array.isArray(data[parentKey]) && data[parentKey].length > 0 && typeof data[parentKey][0] === 'object') {
          return { array: data[parentKey], isRoot: false, parentKey: parentKey };
        }
      }
      throw new Error("Could not find array of objects at key '" + parentKey + "'");
    }

    // If root is array of objects, use it
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      return { array: data, isRoot: true, parentKey: null };
    }

    // Search for first array of objects
    if (data && typeof data === 'object') {
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          var value = data[key];
          if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
            return { array: value, isRoot: false, parentKey: key };
          }
        }
      }
    }

    throw new Error("Could not find an array of objects in the document");
  }

  // Parse CSV with proper escaping and quote handling
  function parseCSV(text) {
    var lines = [];
    var currentLine = [];
    var currentField = '';
    var inQuotes = false;
    var i = 0;

    while (i < text.length) {
      var char = text[i];
      var nextChar = text[i + 1];

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
  }

  // Escape string for JSON
  function escapeForJSON(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  // Compare operator
  function compareValues(a, b, operator) {
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
        return String(a).indexOf(String(b)) !== -1;
      case 'startsWith':
        return String(a).indexOf(String(b)) === 0;
      case 'endsWith':
        var str = String(a);
        var search = String(b);
        return str.lastIndexOf(search) === str.length - search.length;
      default:
        throw new Error("Unknown operator: " + operator);
    }
  }

  // Deep equality check for objects
  function deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

    var keys1 = Object.keys(obj1);
    var keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (var i = 0; i < keys1.length; i++) {
      var key = keys1[i];
      if (!keys2.includes || keys2.indexOf(key) === -1) return false;
      if (!deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
  }

  // Reconstruct JSON maintaining original formatting where possible
  function reconstructJSON(originalText, data, result, isRoot, parentKey) {
    if (isRoot) {
      // Root is the array, just return the result
      return JSON.stringify(result, null, 2);
    } else {
      // Need to update nested property
      data[parentKey] = result;
      return JSON.stringify(data, null, 2);
    }
  }

  // --- Command: csv_to_json ---
  var csv_to_json = new Command(
    "csv_to_json",
    [],
    "replaceAll",
    "Convert CSV to JSON array of objects using first row as keys.",
    [
      new TutorialCommand("csv_to_json", "Convert CSV with headers to JSON array")
    ],
    extensionRoot
  );

  csv_to_json.execute = function (payload) {
    var casing = getExtensionPreference(extensionName, "key_casing") || "snake_case";

    try {
      var lines = parseCSV(payload.fullText);

      if (lines.length < 2) {
        return new ReturnObject("error", "CSV must have at least a header row and one data row.", "");
      }

      var headers = lines[0].map(function(header) {
        return convertCasing(header.trim(), casing);
      });

      var result = [];
      for (var i = 1; i < lines.length; i++) {
        var row = lines[i];
        if (row.length === 0 || (row.length === 1 && row[0] === '')) {
          continue; // Skip empty lines
        }

        var obj = {};
        for (var j = 0; j < headers.length; j++) {
          var value = row[j] || '';
          // Try to parse as number - only if the entire string is a valid number
          var numValue = parseFloat(value);
          var isNumber = !isNaN(numValue) && value !== '' && String(numValue) === value.trim();
          obj[headers[j]] = isNumber ? numValue : value;
        }
        result.push(obj);
      }

      var output = JSON.stringify(result, null, 2);
      return new ReturnObject("success", "Converted CSV to JSON (" + result.length + " objects).", output);
    } catch (e) {
      return new ReturnObject("error", "Invalid CSV: " + e.message, "");
    }
  };

  // --- Command: json_sort ---
  var json_sort = new Command(
    "json_sort",
    [
      new Parameter("string", "key", "Key to sort by", ""),
      new Parameter("bool", "reverse", "Sort in reverse order", false),
      new Parameter("string", "parentKey", "Parent key containing the array (optional)", "")
    ],
    "replaceAll",
    "Sort array of objects by a key value.",
    [
      new TutorialCommand("json_sort('name')", "Sort by name field"),
      new TutorialCommand("json_sort('age', true)", "Sort by age in descending order"),
      new TutorialCommand("json_sort('id', false, 'users')", "Sort users array by id")
    ],
    extensionRoot
  );

  json_sort.execute = function (payload) {
    var params = this.getParsedParams(payload);
    var key = params[0];
    var reverse = params[1];
    var parentKey = params[2] || "";

    if (!key) {
      return new ReturnObject("error", "Key parameter is required.", "");
    }

    try {
      var data = parseLooseJSON(payload.fullText);
      var found = findArrayOfObjects(data, parentKey);
      var array = found.array;

      // Check if key exists in objects
      var hasKey = false;
      for (var i = 0; i < array.length; i++) {
        if (array[i].hasOwnProperty(key)) {
          hasKey = true;
          break;
        }
      }

      if (!hasKey) {
        return new ReturnObject("error", "Key '" + key + "' not found in array objects.", "");
      }

      // Sort the array
      array.sort(function(a, b) {
        var aVal = a[key];
        var bVal = b[key];

        // Handle null/undefined
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        // Numeric comparison if both are numbers
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return reverse ? bVal - aVal : aVal - bVal;
        }

        // String comparison
        var aStr = String(aVal);
        var bStr = String(bVal);
        if (aStr < bStr) return reverse ? 1 : -1;
        if (aStr > bStr) return reverse ? -1 : 1;
        return 0;
      });

      var output = reconstructJSON(payload.fullText, data, array, found.isRoot, found.parentKey);
      return new ReturnObject("success", "Sorted array by '" + key + "'.", output);
    } catch (e) {
      return new ReturnObject("error", e.message, "");
    }
  };

  // --- Command: json_filter ---
  var json_filter = new Command(
    "json_filter",
    [
      new Parameter("string", "key", "Key to filter by", ""),
      new Parameter("string", "operator", "Comparison operator (=, !=, >, <, >=, <=, contains, startsWith, endsWith)", "="),
      new Parameter("string", "value", "Value to compare against", ""),
      new Parameter("string", "parentKey", "Parent key containing the array (optional)", "")
    ],
    "replaceAll",
    "Filter array of objects keeping only items matching criteria.",
    [
      new TutorialCommand("json_filter('status', '=', 'active')", "Keep only active items"),
      new TutorialCommand("json_filter('age', '>', '18')", "Keep items where age > 18"),
      new TutorialCommand("json_filter('name', 'contains', 'John')", "Keep items where name contains John")
    ],
    extensionRoot
  );

  json_filter.execute = function (payload) {
    var params = this.getParsedParams(payload);
    var key = params[0];
    var operator = params[1] || "=";
    var value = params[2];
    var parentKey = params[3] || "";

    if (!key) {
      return new ReturnObject("error", "Key parameter is required.", "");
    }

    try {
      var data = parseLooseJSON(payload.fullText);
      var found = findArrayOfObjects(data, parentKey);
      var array = found.array;

      var filtered = [];
      for (var i = 0; i < array.length; i++) {
        var obj = array[i];
        if (obj.hasOwnProperty(key)) {
          if (compareValues(obj[key], value, operator)) {
            filtered.push(obj);
          }
        }
      }

      var output = reconstructJSON(payload.fullText, data, filtered, found.isRoot, found.parentKey);
      return new ReturnObject("success", "Filtered to " + filtered.length + " items (from " + array.length + ").", output);
    } catch (e) {
      return new ReturnObject("error", e.message, "");
    }
  };

  // --- Command: json_filter_out ---
  var json_filter_out = new Command(
    "json_filter_out",
    [
      new Parameter("string", "key", "Key to filter by", ""),
      new Parameter("string", "operator", "Comparison operator", "="),
      new Parameter("string", "value", "Value to compare against", ""),
      new Parameter("string", "parentKey", "Parent key containing the array (optional)", "")
    ],
    "replaceAll",
    "Filter array of objects removing items matching criteria.",
    [
      new TutorialCommand("json_filter_out('status', '=', 'deleted')", "Remove deleted items"),
      new TutorialCommand("json_filter_out('age', '<', '18')", "Remove items where age < 18")
    ],
    extensionRoot
  );

  json_filter_out.execute = function (payload) {
    var params = this.getParsedParams(payload);
    var key = params[0];
    var operator = params[1] || "=";
    var value = params[2];
    var parentKey = params[3] || "";

    if (!key) {
      return new ReturnObject("error", "Key parameter is required.", "");
    }

    try {
      var data = parseLooseJSON(payload.fullText);
      var found = findArrayOfObjects(data, parentKey);
      var array = found.array;

      var filtered = [];
      for (var i = 0; i < array.length; i++) {
        var obj = array[i];
        if (obj.hasOwnProperty(key)) {
          if (!compareValues(obj[key], value, operator)) {
            filtered.push(obj);
          }
        } else {
          filtered.push(obj); // Keep objects that don't have the key
        }
      }

      var output = reconstructJSON(payload.fullText, data, filtered, found.isRoot, found.parentKey);
      return new ReturnObject("success", "Removed " + (array.length - filtered.length) + " items, kept " + filtered.length + ".", output);
    } catch (e) {
      return new ReturnObject("error", e.message, "");
    }
  };

  // --- Command: json_add_key ---
  var json_add_key = new Command(
    "json_add_key",
    [
      new Parameter("string", "key", "Key to add", ""),
      new Parameter("string", "value", "Value for the key (blank = null)", ""),
      new Parameter("string", "parentKey", "Parent key containing the array (optional)", "")
    ],
    "replaceAll",
    "Add a key-value pair to all objects in array.",
    [
      new TutorialCommand("json_add_key('status', 'active')", "Add status=active to all objects"),
      new TutorialCommand("json_add_key('created', '')", "Add created=null to all objects")
    ],
    extensionRoot
  );

  json_add_key.execute = function (payload) {
    var params = this.getParsedParams(payload);
    var key = params[0];
    var value = params[1];
    var parentKey = params[2] || "";

    if (!key) {
      return new ReturnObject("error", "Key parameter is required.", "");
    }

    try {
      var data = parseLooseJSON(payload.fullText);
      var found = findArrayOfObjects(data, parentKey);
      var array = found.array;

      // Parse value - try as number, then boolean, then string
      var parsedValue = value;
      if (value === '') {
        parsedValue = null;
      } else if (!isNaN(parseFloat(value)) && isFinite(value)) {
        parsedValue = parseFloat(value);
      } else if (value === 'true') {
        parsedValue = true;
      } else if (value === 'false') {
        parsedValue = false;
      }

      for (var i = 0; i < array.length; i++) {
        array[i][key] = parsedValue;
      }

      var output = reconstructJSON(payload.fullText, data, array, found.isRoot, found.parentKey);
      return new ReturnObject("success", "Added '" + key + "' to " + array.length + " objects.", output);
    } catch (e) {
      return new ReturnObject("error", e.message, "");
    }
  };

  // --- Command: json_remove_key ---
  var json_remove_key = new Command(
    "json_remove_key",
    [
      new Parameter("string", "key", "Key to remove", ""),
      new Parameter("string", "parentKey", "Parent key containing the array (optional)", "")
    ],
    "replaceAll",
    "Remove a key from all objects in array.",
    [
      new TutorialCommand("json_remove_key('temp_id')", "Remove temp_id from all objects")
    ],
    extensionRoot
  );

  json_remove_key.execute = function (payload) {
    var params = this.getParsedParams(payload);
    var key = params[0];
    var parentKey = params[1] || "";

    if (!key) {
      return new ReturnObject("error", "Key parameter is required.", "");
    }

    try {
      var data = parseLooseJSON(payload.fullText);
      var found = findArrayOfObjects(data, parentKey);
      var array = found.array;

      var count = 0;
      for (var i = 0; i < array.length; i++) {
        if (array[i].hasOwnProperty(key)) {
          delete array[i][key];
          count++;
        }
      }

      var output = reconstructJSON(payload.fullText, data, array, found.isRoot, found.parentKey);
      return new ReturnObject("success", "Removed '" + key + "' from " + count + " objects.", output);
    } catch (e) {
      return new ReturnObject("error", e.message, "");
    }
  };

  // --- Command: json_set_key ---
  var json_set_key = new Command(
    "json_set_key",
    [
      new Parameter("string", "key", "Key to set", ""),
      new Parameter("string", "value", "New value for the key", ""),
      new Parameter("string", "parentKey", "Parent key containing the array (optional)", "")
    ],
    "replaceAll",
    "Set a key to a specific value in all objects.",
    [
      new TutorialCommand("json_set_key('verified', 'true')", "Set verified=true for all objects"),
      new TutorialCommand("json_set_key('count', '0')", "Reset count to 0 for all objects")
    ],
    extensionRoot
  );

  json_set_key.execute = function (payload) {
    var params = this.getParsedParams(payload);
    var key = params[0];
    var value = params[1];
    var parentKey = params[2] || "";

    if (!key) {
      return new ReturnObject("error", "Key parameter is required.", "");
    }

    try {
      var data = parseLooseJSON(payload.fullText);
      var found = findArrayOfObjects(data, parentKey);
      var array = found.array;

      // Parse value
      var parsedValue = value;
      if (value === '') {
        parsedValue = null;
      } else if (!isNaN(parseFloat(value)) && isFinite(value)) {
        parsedValue = parseFloat(value);
      } else if (value === 'true') {
        parsedValue = true;
      } else if (value === 'false') {
        parsedValue = false;
      }

      for (var i = 0; i < array.length; i++) {
        array[i][key] = parsedValue;
      }

      var output = reconstructJSON(payload.fullText, data, array, found.isRoot, found.parentKey);
      return new ReturnObject("success", "Set '" + key + "' to '" + value + "' in " + array.length + " objects.", output);
    } catch (e) {
      return new ReturnObject("error", e.message, "");
    }
  };

  // --- Command: json_append_key ---
  var json_append_key = new Command(
    "json_append_key",
    [
      new Parameter("string", "key", "Key to append to", ""),
      new Parameter("string", "value", "Value to append", ""),
      new Parameter("string", "parentKey", "Parent key containing the array (optional)", "")
    ],
    "replaceAll",
    "Append value to the end of existing key values.",
    [
      new TutorialCommand("json_append_key('name', ' Jr.')", "Append ' Jr.' to all names"),
      new TutorialCommand("json_append_key('url', '.com')", "Append .com to all URLs")
    ],
    extensionRoot
  );

  json_append_key.execute = function (payload) {
    var params = this.getParsedParams(payload);
    var key = params[0];
    var value = params[1];
    var parentKey = params[2] || "";

    if (!key) {
      return new ReturnObject("error", "Key parameter is required.", "");
    }

    try {
      var data = parseLooseJSON(payload.fullText);
      var found = findArrayOfObjects(data, parentKey);
      var array = found.array;

      var count = 0;
      for (var i = 0; i < array.length; i++) {
        if (array[i].hasOwnProperty(key)) {
          array[i][key] = String(array[i][key]) + value;
          count++;
        }
      }

      var output = reconstructJSON(payload.fullText, data, array, found.isRoot, found.parentKey);
      return new ReturnObject("success", "Appended to '" + key + "' in " + count + " objects.", output);
    } catch (e) {
      return new ReturnObject("error", e.message, "");
    }
  };

  // --- Command: json_prepend_key ---
  var json_prepend_key = new Command(
    "json_prepend_key",
    [
      new Parameter("string", "key", "Key to prepend to", ""),
      new Parameter("string", "value", "Value to prepend", ""),
      new Parameter("string", "parentKey", "Parent key containing the array (optional)", "")
    ],
    "replaceAll",
    "Prepend value to the beginning of existing key values.",
    [
      new TutorialCommand("json_prepend_key('name', 'Dr. ')", "Prepend 'Dr. ' to all names"),
      new TutorialCommand("json_prepend_key('url', 'https://')", "Prepend https:// to all URLs")
    ],
    extensionRoot
  );

  json_prepend_key.execute = function (payload) {
    var params = this.getParsedParams(payload);
    var key = params[0];
    var value = params[1];
    var parentKey = params[2] || "";

    if (!key) {
      return new ReturnObject("error", "Key parameter is required.", "");
    }

    try {
      var data = parseLooseJSON(payload.fullText);
      var found = findArrayOfObjects(data, parentKey);
      var array = found.array;

      var count = 0;
      for (var i = 0; i < array.length; i++) {
        if (array[i].hasOwnProperty(key)) {
          array[i][key] = value + String(array[i][key]);
          count++;
        }
      }

      var output = reconstructJSON(payload.fullText, data, array, found.isRoot, found.parentKey);
      return new ReturnObject("success", "Prepended to '" + key + "' in " + count + " objects.", output);
    } catch (e) {
      return new ReturnObject("error", e.message, "");
    }
  };

  // --- Command: json_dupes ---
  var json_dupes = new Command(
    "json_dupes",
    [
      new Parameter("string", "key", "Key to check for duplicates", ""),
      new Parameter("string", "parentKey", "Parent key containing the array (optional)", "")
    ],
    "insert",
    "Find and display duplicate objects by key value.",
    [
      new TutorialCommand("json_dupes('email')", "Find objects with duplicate emails"),
      new TutorialCommand("json_dupes('id', 'users')", "Find duplicate IDs in users array")
    ],
    extensionRoot
  );

  json_dupes.execute = function (payload) {
    var params = this.getParsedParams(payload);
    var key = params[0];
    var parentKey = params[1] || "";

    if (!key) {
      return new ReturnObject("error", "Key parameter is required.", "");
    }

    try {
      var data = parseLooseJSON(payload.fullText);
      var found = findArrayOfObjects(data, parentKey);
      var array = found.array;

      // Group by key value
      var groups = {};
      for (var i = 0; i < array.length; i++) {
        var obj = array[i];
        if (obj.hasOwnProperty(key)) {
          var keyVal = String(obj[key]);
          if (!groups[keyVal]) {
            groups[keyVal] = [];
          }
          groups[keyVal].push(obj);
        }
      }

      // Find groups with more than one item
      var dupeGroups = [];
      for (var keyVal in groups) {
        if (groups.hasOwnProperty(keyVal) && groups[keyVal].length > 1) {
          dupeGroups.push({ key: keyVal, objects: groups[keyVal] });
        }
      }

      if (dupeGroups.length === 0) {
        return new ReturnObject("success", "No duplicates found for key '" + key + "'.", "# No Duplicates Found");
      }

      // Build output
      var output = "# Duplicates Found\n\n";
      for (var i = 0; i < dupeGroups.length; i++) {
        var group = dupeGroups[i];
        output += "# Duplicate group " + (i + 1) + " (" + key + "=\"" + group.key + "\")\n";
        for (var j = 0; j < group.objects.length; j++) {
          output += JSON.stringify(group.objects[j], null, 2) + "\n";
        }
        output += "\n";
      }

      return new ReturnObject("success", "Found " + dupeGroups.length + " duplicate groups.", output);
    } catch (e) {
      return new ReturnObject("error", e.message, "");
    }
  };

  // --- Command: json_dedupe ---
  var json_dedupe = new Command(
    "json_dedupe",
    [
      new Parameter("bool", "keepFirst", "Keep first occurrence (true) or last (false)", true),
      new Parameter("string", "parentKey", "Parent key containing the array (optional)", "")
    ],
    "replaceAll",
    "Remove exact duplicate objects from array.",
    [
      new TutorialCommand("json_dedupe", "Remove duplicates, keeping first occurrence"),
      new TutorialCommand("json_dedupe(false)", "Remove duplicates, keeping last occurrence")
    ],
    extensionRoot
  );

  json_dedupe.execute = function (payload) {
    var params = this.getParsedParams(payload);
    var keepFirst = params[0];
    var parentKey = params[1] || "";

    try {
      var data = parseLooseJSON(payload.fullText);
      var found = findArrayOfObjects(data, parentKey);
      var array = found.array;

      var seen = [];
      var unique = [];

      if (keepFirst) {
        for (var i = 0; i < array.length; i++) {
          var isDupe = false;
          for (var j = 0; j < seen.length; j++) {
            if (deepEqual(array[i], seen[j])) {
              isDupe = true;
              break;
            }
          }
          if (!isDupe) {
            seen.push(array[i]);
            unique.push(array[i]);
          }
        }
      } else {
        // Keep last - process in reverse
        for (var i = array.length - 1; i >= 0; i--) {
          var isDupe = false;
          for (var j = 0; j < seen.length; j++) {
            if (deepEqual(array[i], seen[j])) {
              isDupe = true;
              break;
            }
          }
          if (!isDupe) {
            seen.push(array[i]);
            unique.unshift(array[i]); // Add to beginning to maintain order
          }
        }
      }

      var output = reconstructJSON(payload.fullText, data, unique, found.isRoot, found.parentKey);
      return new ReturnObject("success", "Removed " + (array.length - unique.length) + " duplicates, kept " + unique.length + " unique objects.", output);
    } catch (e) {
      return new ReturnObject("error", e.message, "");
    }
  };

  // --- Command: json_sort_array ---
  var json_sort_array = new Command(
    "json_sort_array",
    [
      new Parameter("bool", "reverse", "Sort in reverse order", false),
      new Parameter("string", "parentKey", "Parent key containing the array (optional)", "")
    ],
    "replaceAll",
    "Sort an array of primitive values (strings/numbers).",
    [
      new TutorialCommand("json_sort_array", "Sort array of primitives"),
      new TutorialCommand("json_sort_array(true)", "Sort in descending order"),
      new TutorialCommand("json_sort_array(false, 'tags')", "Sort tags array")
    ],
    extensionRoot
  );

  json_sort_array.execute = function (payload) {
    var params = this.getParsedParams(payload);
    var reverse = params[0];
    var parentKey = params[1] || "";

    try {
      var data = parseLooseJSON(payload.fullText);
      var array;
      var isRoot = false;

      if (parentKey) {
        if (data && typeof data === 'object' && data[parentKey]) {
          if (Array.isArray(data[parentKey])) {
            array = data[parentKey];
          } else {
            return new ReturnObject("error", "Key '" + parentKey + "' does not contain an array.", "");
          }
        } else {
          return new ReturnObject("error", "Could not find key '" + parentKey + "'.", "");
        }
      } else {
        if (Array.isArray(data)) {
          array = data;
          isRoot = true;
        } else {
          // Try to find first array
          var foundArray = false;
          for (var key in data) {
            if (data.hasOwnProperty(key) && Array.isArray(data[key])) {
              array = data[key];
              parentKey = key;
              foundArray = true;
              break;
            }
          }
          if (!foundArray) {
            return new ReturnObject("error", "Could not find an array in the document.", "");
          }
        }
      }

      // Check if array contains primitives
      for (var i = 0; i < array.length; i++) {
        if (typeof array[i] === 'object' && array[i] !== null) {
          return new ReturnObject("error", "Array contains objects. Use json_sort for arrays of objects.", "");
        }
      }

      // Sort the array
      array.sort(function(a, b) {
        // Numeric comparison if both are numbers
        if (typeof a === 'number' && typeof b === 'number') {
          return reverse ? b - a : a - b;
        }

        // String comparison
        var aStr = String(a);
        var bStr = String(b);
        if (aStr < bStr) return reverse ? 1 : -1;
        if (aStr > bStr) return reverse ? -1 : 1;
        return 0;
      });

      var output = isRoot ? JSON.stringify(array, null, 2) : JSON.stringify(data, null, 2);
      return new ReturnObject("success", "Sorted array of " + array.length + " items.", output);
    } catch (e) {
      return new ReturnObject("error", e.message, "");
    }
  };
})();
