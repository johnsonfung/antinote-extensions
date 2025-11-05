// ===============================
// Antinote Extension: line_format
// Version 1.0.0
// ===============================

(function () {
  var extensionName = "line_format";

  var extensionRoot = new Extension(
    extensionName,
    "1.0.0",
    [],
    [],
    "johnsonfung",
    "Text Formatting",
    "line"  // Only needs current line access
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
      .replace(/[^a-zA-Z0-9]+(.)/g, function (match, chr) {
        return chr.toUpperCase();
      })
      .replace(/^[A-Z]/, function (match) {
        return match.toLowerCase();
      });
  }

  function toSnakeCase(text) {
    // Convert to snake_case
    return text
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/([A-Z])/g, function (match) {
        return "_" + match.toLowerCase();
      })
      .replace(/^_+|_+$/g, "")
      .toLowerCase();
  }

  function toKebabCase(text) {
    // Convert to kebab-case
    return text
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/([A-Z])/g, function (match) {
        return "-" + match.toLowerCase();
      })
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
  }

  function removeQuotes(text) {
    console.log("removeQuotes INPUT:", JSON.stringify(text));
    var result = text;
    var changed = true;
    var iteration = 0;

    // Keep removing pairs until no more found
    while (changed && iteration < 100) {
      changed = false;
      iteration++;
      console.log("Iteration " + iteration + ":", JSON.stringify(result));

      // Find all valid quote positions (not apostrophes between letters/numbers)
      var quoteChars = ['"', "'", "\u201C", "\u201D", "\u2018", "\u2019"];
      var validQuotes = [];

      for (var i = 0; i < result.length; i++) {
        if (quoteChars.indexOf(result[i]) !== -1) {
          // Check if between alphanumerics (apostrophe case)
          var before = i > 0 ? result[i - 1] : '';
          var after = i < result.length - 1 ? result[i + 1] : '';
          var isAlphanumBefore = /[a-zA-Z0-9]/.test(before);
          var isAlphanumAfter = /[a-zA-Z0-9]/.test(after);

          // Only valid if NOT between two alphanumerics
          if (!(isAlphanumBefore && isAlphanumAfter)) {
            validQuotes.push({ pos: i, char: result[i] });
          }
        }
      }

      console.log("Valid quotes found:", validQuotes.length);

      // Find first pair
      if (validQuotes.length >= 2) {
        var firstQuote = validQuotes[0];
        var matchingQuote = null;

        // Find next matching quote of same type (handle smart quotes pairing)
        for (var j = 1; j < validQuotes.length; j++) {
          var currentChar = validQuotes[j].char;
          var firstChar = firstQuote.char;

          // Check if same type (handle straight quotes and smart quote pairs)
          var isMatch = currentChar === firstChar ||
            (firstChar === "\u201C" && currentChar === "\u201D") ||
            (firstChar === "\u201D" && currentChar === "\u201C") ||
            (firstChar === "\u2018" && currentChar === "\u2019");

          if (isMatch) {
            matchingQuote = validQuotes[j];
            break;
          }
        }

        if (matchingQuote) {
          console.log("Removing pair at positions", firstQuote.pos, "and", matchingQuote.pos);
          // Remove both quotes
          result = result.substring(0, firstQuote.pos) +
            result.substring(firstQuote.pos + 1, matchingQuote.pos) +
            result.substring(matchingQuote.pos + 1);
          changed = true;
        }
      }
    }

    console.log("removeQuotes OUTPUT:", JSON.stringify(result));
    return result;
  }

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

  uppercase_line.execute = function (payload) {
    var result = payload.fullText.toUpperCase();
    return new ReturnObject("success", "Line converted to uppercase.", result);
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

  lowercase_line.execute = function (payload) {
    var result = payload.fullText.toLowerCase();
    return new ReturnObject("success", "Line converted to lowercase.", result);
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

  sentence_case_line.execute = function (payload) {
    var result = sentenceCase(payload.fullText);
    return new ReturnObject("success", "Line converted to sentence case.", result);
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

  title_case_line.execute = function (payload) {
    var result = titleCase(payload.fullText);
    return new ReturnObject("success", "Line converted to title case.", result);
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

  camel_case.execute = function (payload) {
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

  snake_case.execute = function (payload) {
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

  kebab_case.execute = function (payload) {
    var result = toKebabCase(payload.fullText);
    return new ReturnObject("success", "Line converted to kebab-case.", result);
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

  remove_quotes_line.execute = function (payload) {
    var result = removeQuotes(payload.fullText);
    return new ReturnObject("success", "Quotes removed from line.", result);
  };
})();
