(function () {
  // 1. Name your extension (wrapped in IIFE to avoid variable conflicts)
  const extensionName = "random";

  // 2. Create the extension root with endpoints and required API keys
  const extensionRoot = new Extension({
    name: extensionName,
    version: "1.0.0",
    endpoints: [], // No external API endpoints
    requiredAPIKeys: [],  // No API keys required
    author: "johnsonfung",  // Author (GitHub username)
    category: "Random Generators",  // Category
    dataScope: "none"  // Data scope: "none", "line", or "full" - doesn't need note content
  });

  // 3. Create a command for your extension
  const random_number = new Command({
    name: "random_number", // This is the name of the command and what the user will type in the note to trigger it. Please use snake_case.

    // 4. Create the parameters for the command. Every parameter must have a type, name, and helpText.
    // type: The type of the parameter. Possible values are "float", "int", "bool", "string"
    // name: The name of the parameter
    // helpText: The help text for the parameter that the user sees
    // default: The default value for the parameter
    parameters: [
      new Parameter({type: "float", name: "from", helpText: "bottom range", default: 0, required: false}),
      new Parameter({type: "float", name: "to", helpText: "top range", default: 100, required: false}),
      new Parameter({type: "bool", name: "int", helpText: "round to nearest whole number", default: true, required: false}),
      new Parameter({type: "int", name: "count", helpText: "number of random numbers to generate", default: 1, required: false})
    ],
    type: "insert", // This is the action the command will do to the user's note: "insert", "replaceLine", "replaceAll", or "openURL"
    helpText: "Insert a random number between two values.", // This is the description text for the command

    // Give examples of how to use the command. This will show up in the UI.
    tutorials: [
      new TutorialCommand({command: "random_number", description: "Insert a random integer between 0 and 100."}),
      new TutorialCommand({command: "random_number(10, 20)", description: "Insert a random integer between 10 and 20."}),
      new TutorialCommand({command: "random_number(10, 20, false)", description: "Insert a random decimal number between 10 and 20."}),
      new TutorialCommand({command: "random_number(1, 100, true, 5)", description: "Insert 5 random integers between 1 and 100, comma-separated."})
    ],
    extension: extensionRoot
  });

  // 5. Write your function
  random_number.execute = function (payload) {
    // This will automatically replace empty parameters with the default values and parse them based on the parameter type
    const [from, to, int, count] = this.getParsedParams(payload);

    // Error handling
    if (from > to) {
      return new ReturnObject({status: "error", message: "The 'from' value cannot be greater than the 'to' value."});
    }

    if (from < 0 || to < 0) {
      return new ReturnObject({status: "error", message: "Values cannot be negative."});
    }

    if (count < 1) {
      return new ReturnObject({status: "error", message: "Count must be at least 1."});
    }

    if (count > 1000) {
      return new ReturnObject({status: "error", message: "Cannot generate more than 1000 numbers at once."});
    }

    console.log(from, to, int, count); // Console logs will appear in Terminal if you launch Antinote from the command line. Starts with 'JS console.log'

    const numbers = [];
    for (let i = 0; i < count; i++) {
      let result = Math.random() * (to - from) + from;
      if (int) {
        result = Math.floor(result);
      }
      numbers.push(result);
    }

    const payload_result = count === 1 ? numbers[0] : numbers.join(', ');

    return new ReturnObject({status: "success", message: "Random number(s) generated.", payload: payload_result});
  };

  // Another example command that generates a series of random letters
  const random_letters = new Command({
    name: "random_letters",
    parameters: [
      new Parameter({type: "int", name: "numberOfLetters", helpText: "Number of letters to generate", default: 1, required: false}),
    ],
    type: "insert",
    helpText: "Insert a random letter or series of letters.",
    tutorials: [
      new TutorialCommand({command: "random_letters", description: "Insert a random letter."}),
      new TutorialCommand({command: "random_letters(5)", description: "Insert 5 random letters."})
    ],
    extension: extensionRoot
  });

  random_letters.execute = function (payload) {
    const [numberOfLetters] = this.getParsedParams(payload);

    // Error handling
    if (numberOfLetters < 1) {
      return new ReturnObject({status: "error", message: "Number of letters must be at least 1."});
    }

    if (numberOfLetters > 1000) {
      return new ReturnObject({status: "error", message: "Cannot generate more than 1000 letters at once."});
    }

    let result = "";
    for (let i = 0; i < numberOfLetters; i++) {
      result += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }

    return new ReturnObject({status: "success", message: "Random letters generated.", payload: result});
  };

  // Another example command that replaces the whole text with a random quote
  const random_quote = new Command({
    name: "random_quote",
    parameters: [],
    type: "insert",
    helpText: "Insert a random quote.",
    tutorials: [
      new TutorialCommand({command: "random_quote", description: "Insert a random quote."})
    ],
    extension: extensionRoot
  });

  random_quote.execute = function (payload) {
    const quotes = [
      "Letting go gives us freedom, and freedom is the only condition for happiness.",
      "You can only lose what you cling to.",
      "The foot feels the foot when it feels the ground.",
      "In the end, these things matter most: How well did you love? How fully did you live? How deeply did you let go?",
      "Learning to let go should be learned before learning to get.",
      "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
      "When you let go of what you are, you become what you might be.",
      "To let go is to be free."
    ];

    const result = quotes[Math.floor(Math.random() * quotes.length)];

    return new ReturnObject({status: "success", message: "Random quote inserted.", payload: result});
  };

  // Another example that opens a URL.
  // If the user's note contains the word "cat", it will open the wikipedia page for cats.
  // Otherwise it will open a random wikipedia page.
  const random_wiki = new Command({
    name: "random_wiki",
    parameters: [],
    type: "openURL",
    helpText: "Open a random Wikipedia page.",
    tutorials: [
      new TutorialCommand({command: "random_wiki", description: "Open a random Wikipedia page."})
    ],
    extension: extensionRoot
  });

  random_wiki.execute = function (payload) {
    const url = "https://en.wikipedia.org/wiki/Special:Random";

    return new ReturnObject({status: "success", message: "Opening random Wikipedia page.", payload: url});
  };
})();
