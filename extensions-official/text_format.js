// ===============================
// Antinote Extension: text_format
// Version 1.0.0
// ===============================

(function() {
  var extensionName = "text_format";

  var extensionRoot = new Extension(
    extensionName,
    "1.0.0",
    [],
    [],
    "johnsonfung",
    "Text Formatting",
    "full"  // Needs full document access for most operations
  );

  // --- Helper Functions ---

  function sentenceCase(text) {
    // Capitalize first letter, lowercase the rest
    if (!text || text.length === 0) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  function titleCase(text) {
    // Capitalize first letter of each word
    var smallWords = ["a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on", "or", "so", "the", "to", "up", "yet"];
    var words = text.toLowerCase().split(" ");

    for (var i = 0; i < words.length; i++) {
      // Always capitalize first and last word, or if not a small word
      if (i === 0 || i === words.length - 1 || smallWords.indexOf(words[i]) === -1) {
        if (words[i].length > 0) {
          words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
        }
      }
    }

    return words.join(" ");
  }

  function toCamelCase(text) {
    // Remove special characters and convert to camelCase
    return text
      .replace(/[^a-zA-Z0-9]+(.)/g, function(match, chr) {
        return chr.toUpperCase();
      })
      .replace(/^[A-Z]/, function(match) {
        return match.toLowerCase();
      });
  }

  function toSnakeCase(text) {
    // Convert to snake_case
    return text
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/([A-Z])/g, function(match) {
        return "_" + match.toLowerCase();
      })
      .replace(/^_+|_+$/g, "")
      .toLowerCase();
  }

  function toKebabCase(text) {
    // Convert to kebab-case
    return text
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/([A-Z])/g, function(match) {
        return "-" + match.toLowerCase();
      })
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
  }

  function removeQuotes(text) {
    // Remove surrounding quotes (single or double)
    return text.replace(/^["']|["']$/g, "");
  }

  // --- Command: replace ---
  var replace = new Command(
    "replace",
    [
      new Parameter("string", "find", "Text to find", ""),
      new Parameter("string", "replaceWith", "Text to replace with", "")
    ],
    "replaceAll",
    "Find and replace text throughout the entire document.",
    [
      new TutorialCommand("replace(old, new)", "Replace 'old' with 'new'"),
      new TutorialCommand("replace(foo, bar)", "Replace all 'foo' with 'bar'")
    ],
    extensionRoot
  );

  replace.execute = function(payload) {
    var params = this.getParsedParams(payload);
    var find = params[0];
    var replaceWith = params[1];

    if (!find) {
      return new ReturnObject("error", "Please provide text to find.");
    }

    var result = payload.fullText.split(find).join(replaceWith);
    return new ReturnObject("success", "Text replaced.", result);
  };

  // --- Command: append ---
  var append = new Command(
    "append",
    [
      new Parameter("string", "text", "Text to append to each line", "")
    ],
    "replaceAll",
    "Add text to the end of every line in the document.",
    [
      new TutorialCommand("append(;)", "Add semicolon to end of each line"),
      new TutorialCommand("append( ->)", "Add arrow to end of each line")
    ],
    extensionRoot
  );

  append.execute = function(payload) {
    var params = this.getParsedParams(payload);
    var text = params[0];

    var lines = payload.fullText.split("\n");
    var result = [];
    for (var i = 0; i < lines.length; i++) {
      result.push(lines[i] + text);
    }

    return new ReturnObject("success", "Text appended to all lines.", result.join("\n"));
  };

  // --- Command: prepend ---
  var prepend = new Command(
    "prepend",
    [
      new Parameter("string", "text", "Text to prepend to each line", "")
    ],
    "replaceAll",
    "Add text to the beginning of every line in the document.",
    [
      new TutorialCommand("prepend(- )", "Add dash bullet to each line"),
      new TutorialCommand("prepend(> )", "Add quote marker to each line")
    ],
    extensionRoot
  );

  prepend.execute = function(payload) {
    var params = this.getParsedParams(payload);
    var text = params[0];

    var lines = payload.fullText.split("\n");
    var result = [];
    for (var i = 0; i < lines.length; i++) {
      result.push(text + lines[i]);
    }

    return new ReturnObject("success", "Text prepended to all lines.", result.join("\n"));
  };

  // --- Command: uppercase_line ---
  var uppercase_line = new Command(
    "uppercase_line",
    [],
    "replaceLine",
    "Convert the current line to uppercase.",
    [
      new TutorialCommand("uppercase_line", "Make current line uppercase")
    ],
    extensionRoot
  );

  uppercase_line.execute = function(payload) {
    var result = payload.fullText.toUpperCase();
    return new ReturnObject("success", "Line converted to uppercase.", result);
  };

  // --- Command: uppercase ---
  var uppercase = new Command(
    "uppercase",
    [],
    "replaceAll",
    "Convert the entire document to uppercase.",
    [
      new TutorialCommand("uppercase", "Make entire document uppercase")
    ],
    extensionRoot
  );

  uppercase.execute = function(payload) {
    var result = payload.fullText.toUpperCase();
    return new ReturnObject("success", "Document converted to uppercase.", result);
  };

  // --- Command: lowercase_line ---
  var lowercase_line = new Command(
    "lowercase_line",
    [],
    "replaceLine",
    "Convert the current line to lowercase.",
    [
      new TutorialCommand("lowercase_line", "Make current line lowercase")
    ],
    extensionRoot
  );

  lowercase_line.execute = function(payload) {
    var result = payload.fullText.toLowerCase();
    return new ReturnObject("success", "Line converted to lowercase.", result);
  };

  // --- Command: lowercase ---
  var lowercase = new Command(
    "lowercase",
    [],
    "replaceAll",
    "Convert the entire document to lowercase.",
    [
      new TutorialCommand("lowercase", "Make entire document lowercase")
    ],
    extensionRoot
  );

  lowercase.execute = function(payload) {
    var result = payload.fullText.toLowerCase();
    return new ReturnObject("success", "Document converted to lowercase.", result);
  };

  // --- Command: sentence_case_line ---
  var sentence_case_line = new Command(
    "sentence_case_line",
    [],
    "replaceLine",
    "Convert the current line to sentence case (first letter capitalized).",
    [
      new TutorialCommand("sentence_case_line", "Convert current line to sentence case")
    ],
    extensionRoot
  );

  sentence_case_line.execute = function(payload) {
    var result = sentenceCase(payload.fullText);
    return new ReturnObject("success", "Line converted to sentence case.", result);
  };

  // --- Command: sentence_case ---
  var sentence_case = new Command(
    "sentence_case",
    [],
    "replaceAll",
    "Convert the entire document to sentence case.",
    [
      new TutorialCommand("sentence_case", "Convert entire document to sentence case")
    ],
    extensionRoot
  );

  sentence_case.execute = function(payload) {
    var lines = payload.fullText.split("\n");
    var result = [];
    for (var i = 0; i < lines.length; i++) {
      result.push(sentenceCase(lines[i]));
    }
    return new ReturnObject("success", "Document converted to sentence case.", result.join("\n"));
  };

  // --- Command: title_case_line ---
  var title_case_line = new Command(
    "title_case_line",
    [],
    "replaceLine",
    "Convert the current line to title case.",
    [
      new TutorialCommand("title_case_line", "Convert current line to title case")
    ],
    extensionRoot
  );

  title_case_line.execute = function(payload) {
    var result = titleCase(payload.fullText);
    return new ReturnObject("success", "Line converted to title case.", result);
  };

  // --- Command: title_case ---
  var title_case = new Command(
    "title_case",
    [],
    "replaceAll",
    "Convert the entire document to title case.",
    [
      new TutorialCommand("title_case", "Convert entire document to title case")
    ],
    extensionRoot
  );

  title_case.execute = function(payload) {
    var lines = payload.fullText.split("\n");
    var result = [];
    for (var i = 0; i < lines.length; i++) {
      result.push(titleCase(lines[i]));
    }
    return new ReturnObject("success", "Document converted to title case.", result.join("\n"));
  };

  // --- Command: capitalize_first ---
  var capitalize_first = new Command(
    "capitalize_first",
    [],
    "replaceAll",
    "Capitalize the first letter of each line in the document.",
    [
      new TutorialCommand("capitalize_first", "Capitalize first letter of each line")
    ],
    extensionRoot
  );

  capitalize_first.execute = function(payload) {
    var lines = payload.fullText.split("\n");
    var result = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line.length > 0) {
        result.push(line.charAt(0).toUpperCase() + line.slice(1));
      } else {
        result.push(line);
      }
    }
    return new ReturnObject("success", "First letter of each line capitalized.", result.join("\n"));
  };

  // --- Command: camel_case ---
  var camel_case = new Command(
    "camel_case",
    [],
    "replaceLine",
    "Convert the current line to camelCase.",
    [
      new TutorialCommand("camel_case", "Convert line to camelCase")
    ],
    extensionRoot
  );

  camel_case.execute = function(payload) {
    var result = toCamelCase(payload.fullText);
    return new ReturnObject("success", "Line converted to camelCase.", result);
  };

  // --- Command: snake_case ---
  var snake_case = new Command(
    "snake_case",
    [],
    "replaceLine",
    "Convert the current line to snake_case.",
    [
      new TutorialCommand("snake_case", "Convert line to snake_case")
    ],
    extensionRoot
  );

  snake_case.execute = function(payload) {
    var result = toSnakeCase(payload.fullText);
    return new ReturnObject("success", "Line converted to snake_case.", result);
  };

  // --- Command: kebab_case ---
  var kebab_case = new Command(
    "kebab_case",
    [],
    "replaceLine",
    "Convert the current line to kebab-case.",
    [
      new TutorialCommand("kebab_case", "Convert line to kebab-case")
    ],
    extensionRoot
  );

  kebab_case.execute = function(payload) {
    var result = toKebabCase(payload.fullText);
    return new ReturnObject("success", "Line converted to kebab-case.", result);
  };

  // --- Command: remove_quotes ---
  var remove_quotes = new Command(
    "remove_quotes",
    [],
    "replaceAll",
    "Remove surrounding quotes from each line in the document.",
    [
      new TutorialCommand("remove_quotes", "Remove quotes from all lines")
    ],
    extensionRoot
  );

  remove_quotes.execute = function(payload) {
    var lines = payload.fullText.split("\n");
    var result = [];
    for (var i = 0; i < lines.length; i++) {
      result.push(removeQuotes(lines[i]));
    }
    return new ReturnObject("success", "Quotes removed from document.", result.join("\n"));
  };

  // --- Command: remove_quotes_line ---
  var remove_quotes_line = new Command(
    "remove_quotes_line",
    [],
    "replaceLine",
    "Remove surrounding quotes from the current line.",
    [
      new TutorialCommand("remove_quotes_line", "Remove quotes from current line")
    ],
    extensionRoot
  );

  remove_quotes_line.execute = function(payload) {
    var result = removeQuotes(payload.fullText);
    return new ReturnObject("success", "Quotes removed from line.", result);
  };
})();
