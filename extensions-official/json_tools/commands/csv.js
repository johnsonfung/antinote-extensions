// CSV to JSON conversion command

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["json_tools"];
  const SmartExtractor = ctx.shared.SmartExtractor;
  const Formatters = ctx.shared.Formatters;
  const extensionRoot = ctx.root;

  // Helper: Parse CSV with proper escaping and quote handling
  const parseCSV = (text) => {
    const lines = [];
    let currentLine = [];
    let currentField = '';
    let inQuotes = false;
    let stringChar = null;
    let escapeNext = false;
    let i = 0;

    while (i < text.length) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (escapeNext) {
        escapeNext = false;
        i++;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        currentField += char;
        i++;
        continue;
      }

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

  // Command: csv_to_json
  const csv_to_json = new Command({
    name: "csv_to_json",
    parameters: [
      new Parameter({type: "string", name: "parent_key", helpText: "Parent key to find CSV data (optional)", default: "", required: false})
    ],
    type: "replaceAll",
    helpText: "Convert CSV to JSON array of objects using first row as keys.",
    tutorials: [
      new TutorialCommand({command: "csv_to_json", description: "Convert CSV with headers to JSON array"}),
      new TutorialCommand({command: "csv_to_json('data')", description: "Convert CSV found at 'data' key"})
    ],
    extension: extensionRoot
  });

  csv_to_json.execute = function (payload) {
    const params = this.getParsedParams(payload);
    const parent_key = params[0] || "";

    const casing = getExtensionPreference("json_tools", "key_casing") || "snake_case";
    const formatPref = Formatters.getFormatPreference();
    const fullText = payload.fullText || "";

    try {
      let csvText = fullText;

      // If parent_key is provided, try to extract it
      if (parent_key) {
        try {
          const extraction = SmartExtractor.extract(fullText, parent_key);
          // If the extracted value is a string, use it as CSV
          if (typeof extraction.processed === 'string') {
            csvText = extraction.processed;
          } else {
            return new ReturnObject({status: "error", message: `Key '${parent_key}' does not contain a string value.`, payload: ""});
          }
        } catch (e) {
          // If extraction fails, just use the full text
          csvText = fullText;
        }
      }

      const lines = parseCSV(csvText);

      if (lines.length < 2) {
        return new ReturnObject({status: "error", message: "CSV must have at least a header row and one data row.", payload: ""});
      }

      const headers = lines[0].map(header => Formatters.convertCasing(header.trim(), casing));

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

      const output = SmartExtractor.format(result, formatPref);
      return new ReturnObject({status: "success", message: `Converted CSV to JSON (${result.length} objects).`, payload: output});
    } catch (e) {
      return new ReturnObject({status: "error", message: `Invalid CSV: ${e.message}`, payload: ""});
    }
  };
})();
