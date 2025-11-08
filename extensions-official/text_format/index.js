// ===============================
// Antinote Extension: text_format
// Version 1.0.0
// ===============================

(function () {
  var extensionName = "text_format";

  var extensionRoot = new Extension(
    extensionName,
    "1.0.0",
    [],
    [],
    "johnsonfung",
    "Text Formatting",
    "full"  // Needs full document access
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

  replace.execute = function (payload) {
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

  append.execute = function (payload) {
    var params = this.getParsedParams(payload);
    var text = params[0];

    var lines = payload.fullText.split("\n");
    var result = [];
    for (var i = 0; i < lines.length; i++) {
      // Only append to non-empty lines
      if (lines[i].trim().length > 0) {
        result.push(lines[i] + text);
      } else {
        result.push(lines[i]);
      }
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

  prepend.execute = function (payload) {
    var params = this.getParsedParams(payload);
    var text = params[0];

    var lines = payload.fullText.split("\n");
    var result = [];
    for (var i = 0; i < lines.length; i++) {
      // Only prepend to non-empty lines
      if (lines[i].trim().length > 0) {
        result.push(text + lines[i]);
      } else {
        result.push(lines[i]);
      }
    }

    return new ReturnObject("success", "Text prepended to all lines.", result.join("\n"));
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

  uppercase.execute = function (payload) {
    var result = payload.fullText.toUpperCase();
    return new ReturnObject("success", "Document converted to uppercase.", result);
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

  lowercase.execute = function (payload) {
    var result = payload.fullText.toLowerCase();
    return new ReturnObject("success", "Document converted to lowercase.", result);
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

  sentence_case.execute = function (payload) {
    var lines = payload.fullText.split("\n");
    var result = [];
    for (var i = 0; i < lines.length; i++) {
      result.push(sentenceCase(lines[i]));
    }
    return new ReturnObject("success", "Document converted to sentence case.", result.join("\n"));
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

  title_case.execute = function (payload) {
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

  capitalize_first.execute = function (payload) {
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

  remove_quotes.execute = function (payload) {
    var lines = payload.fullText.split("\n");
    var result = [];
    for (var i = 0; i < lines.length; i++) {
      result.push(removeQuotes(lines[i]));
    }
    return new ReturnObject("success", "Quotes removed from document.", result.join("\n"));
  };
})();
