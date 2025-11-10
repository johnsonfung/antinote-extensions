// Smart JSON/Object Extraction System
// Provides intelligent extraction of JSON/JS objects from text with dot notation support

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["json_tools"];

  // Extract balanced braces/brackets starting at index
  const extractBalancedObject = (text, startIdx) => {
    const startChar = text[startIdx];
    const endChar = startChar === '{' ? '}' : ']';
    let depth = 0;
    let inString = false;
    let stringChar = null;
    let escapeNext = false;

    for (let i = startIdx; i < text.length; i++) {
      const char = text[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (!inString) {
        if (char === '"' || char === "'") {
          inString = true;
          stringChar = char;
          continue;
        }

        if (char === startChar) depth++;
        if (char === endChar) depth--;

        if (depth === 0) {
          const objectStr = text.substring(startIdx, i + 1);
          try {
            // Try JSON.parse first
            const parsed = JSON.parse(objectStr);
            return {object: parsed, endIdx: i + 1};
          } catch {
            // Fall back to eval for looser JS syntax
            try {
              const parsed = eval('(' + objectStr + ')');
              return {object: parsed, endIdx: i + 1};
            } catch (e) {
              throw new Error(`Invalid object syntax: ${e.message}`);
            }
          }
        }
      } else {
        if (char === stringChar) {
          inString = false;
          stringChar = null;
        }
      }
    }

    throw new Error("Unbalanced braces/brackets - missing closing " + endChar);
  };

  // Get nested value using dot notation
  const getNestedValue = (obj, path) => {
    if (!path) return obj;

    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current == null || typeof current !== 'object') {
        throw new Error(`Cannot access property '${part}' on non-object`);
      }

      if (!current.hasOwnProperty(part)) {
        throw new Error(`Property '${part}' not found in path '${path}'`);
      }

      current = current[part];
    }

    return current;
  };

  // Set nested value using dot notation
  const setNestedValue = (obj, path, value) => {
    if (!path) {
      throw new Error("Path cannot be empty");
    }

    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];

      if (!current.hasOwnProperty(part)) {
        current[part] = {};
      } else if (typeof current[part] !== 'object' || current[part] === null) {
        throw new Error(`Cannot set property on non-object at '${parts.slice(0, i + 1).join('.')}'`);
      }

      current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;

    return obj;
  };

  // Extract processable section from text
  // Returns: {prefix, processed, suffix, path, rootObject, startIdx, endIdx}
  const extract = (text, path) => {
    if (path) {
      // Handle dot notation - look for first part
      const parts = path.split('.');
      const rootKey = parts[0];

      // Look for "rootKey:" or "rootKey :" or '"rootKey":'
      const keyPattern = new RegExp(`["']?${rootKey}["']?\\s*:\\s*([{\\[])`);
      const match = text.match(keyPattern);

      if (match) {
        const startIdx = match.index + match[0].length - 1;
        const result = extractBalancedObject(text, startIdx);

        let processed = result.object;
        if (parts.length > 1) {
          const nestedPath = parts.slice(1).join('.');
          processed = getNestedValue(result.object, nestedPath);
        }

        return {
          prefix: text.substring(0, match.index),
          processed: processed,
          suffix: text.substring(result.endIdx),
          path: path,
          rootObject: result.object,
          rootKey: rootKey,
          startIdx: match.index,
          endIdx: result.endIdx
        };
      }

      throw new Error(`Path '${path}' not found in document`);
    }

    // No path - find first { or [
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');

    let startIdx = -1;
    if (firstBrace !== -1 && firstBracket !== -1) {
      startIdx = Math.min(firstBrace, firstBracket);
    } else if (firstBrace !== -1) {
      startIdx = firstBrace;
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
    } else {
      throw new Error("No JSON object or array found in document");
    }

    const result = extractBalancedObject(text, startIdx);

    return {
      prefix: text.substring(0, startIdx),
      processed: result.object,
      suffix: text.substring(result.endIdx),
      path: null,
      rootObject: result.object,
      rootKey: null,
      startIdx: startIdx,
      endIdx: result.endIdx
    };
  };

  // Find all instances of a key in the document
  // Returns array of extraction results
  const extractAll = (text, key) => {
    if (!key) {
      // No key specified - return single extraction
      return [extract(text)];
    }

    const results = [];
    const keyPattern = new RegExp(`["']?${key}["']?\\s*:\\s*([{\\[])`, 'g');
    let match;

    while ((match = keyPattern.exec(text)) !== null) {
      try {
        const startIdx = match.index + match[0].length - 1;
        const result = extractBalancedObject(text, startIdx);

        results.push({
          prefix: text.substring(0, match.index),
          processed: result.object,
          suffix: text.substring(result.endIdx),
          path: key,
          rootObject: result.object,
          rootKey: key,
          startIdx: match.index,
          endIdx: result.endIdx,
          matchIndex: match.index
        });
      } catch (e) {
        // Skip invalid objects
        continue;
      }
    }

    if (results.length === 0) {
      throw new Error(`Key '${key}' not found in document`);
    }

    return results;
  };

  // Format object according to preference
  const format = (obj, preference) => {
    preference = preference || "pretty";

    switch (preference) {
      case "pretty":
        return JSON.stringify(obj, null, 2);
      case "compact":
        return JSON.stringify(obj, null, 0);
      case "minified":
        return JSON.stringify(obj);
      default:
        return JSON.stringify(obj, null, 2);
    }
  };

  // Reconstruct text with updated object
  const reconstruct = (text, extracted, newValue, formatPreference) => {
    const formatted = format(newValue, formatPreference);
    return extracted.prefix + formatted + extracted.suffix;
  };

  // Reconstruct text with multiple updated objects
  const reconstructAll = (text, extractions, newValues, formatPreference) => {
    if (extractions.length !== newValues.length) {
      throw new Error("Extractions and values arrays must have same length");
    }

    // Sort by position (reverse order to replace from end to start)
    const sorted = extractions.map((ext, idx) => ({ext, value: newValues[idx]}))
                              .sort((a, b) => b.ext.startIdx - a.ext.startIdx);

    let result = text;
    for (const {ext, value} of sorted) {
      const formatted = format(value, formatPreference);
      result = result.substring(0, ext.startIdx) +
               ext.rootKey + ": " + formatted +
               result.substring(ext.endIdx);
    }

    return result;
  };

  // Export to shared namespace
  ctx.shared.SmartExtractor = {
    extract,
    extractAll,
    getNestedValue,
    setNestedValue,
    format,
    reconstruct,
    reconstructAll
  };
})();
