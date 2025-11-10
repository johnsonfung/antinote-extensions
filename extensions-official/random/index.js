(function () {
  // 1. Name your extension (wrapped in IIFE to avoid variable conflicts)
  const extensionName = "random";

  // 2. Create the extension root with endpoints and required API keys
  const extensionRoot = new Extension(
    extensionName,
    "1.0.0",
    [], // No external API endpoints
    [],  // No API keys required
    "johnsonfung",  // Author (GitHub username)
    "Random Generators",  // Category
    "none"  // Data scope: "none", "line", or "full" - doesn't need note content
  );

  // 3. Create a command for your extension
  const random_number = new Command(
    "random_number", // This is the name of the command and what the user will type in the note to trigger it. Please use snake_case.

    // 4. Create the parameters for the command. Every parameter must have a type, name, and helpText.
    // type: The type of the parameter. Possible values are "float", "int", "bool", "string"
    // name: The name of the parameter
    // helpText: The help text for the parameter that the user sees
    // defaultValue: The default value for the parameter
    [
      new Parameter("float", "from", "bottom range", 0),
      new Parameter("float", "to", "top range", 100),
      new Parameter("bool", "int", "round to nearest whole number", true)
    ],
    "insert", // This is the action the command will do to the user's note: "insert", "replaceLine", "replaceAll", or "openURL"
    "Insert a random number between two values.", // This is the description text for the command

    // Give examples of how to use the command. This will show up in the UI.
    [
      new TutorialCommand("random_number", "Insert a random integer between 0 and 100."),
      new TutorialCommand("random_number(10, 20)", "Insert a random integer between 10 and 20."),
      new TutorialCommand("random_number(10, 20, false)", "Insert a random decimal number between 10 and 20.")
    ],
    extensionRoot
  );

  // 5. Write your function
  random_number.execute = function (payload) {
    // This will automatically replace empty parameters with the default values and parse them based on the parameter type
    const [from, to, int] = this.getParsedParams(payload);

    // Error handling
    if (from > to) {
      return new ReturnObject("error", "The 'from' value cannot be greater than the 'to' value.");
    }

    if (from < 0 || to < 0) {
      return new ReturnObject("error", "Values cannot be negative.");
    }

    console.log(from, to, int); // Console logs will appear in Terminal if you launch Antinote from the command line. Starts with 'JS console.log'

    let result = Math.random() * (to - from) + from;
    if (int) {
      result = Math.floor(result);
    }

    return new ReturnObject("success", "Random number generated.", result);
  };

  // Another example command that generates a series of random letters
  const random_letters = new Command(
    "random_letters",
    [
      new Parameter("int", "numberOfLetters", "Number of letters to generate", 1),
    ],
    "insert",
    "Insert a random letter or series of letters.",
    [
      new TutorialCommand("random_letters", "Insert a random letter."),
      new TutorialCommand("random_letters(5)", "Insert 5 random letters.")
    ],
    extensionRoot
  );

  random_letters.execute = function (payload) {
    const [numberOfLetters] = this.getParsedParams(payload);

    // Error handling
    if (numberOfLetters < 1) {
      return new ReturnObject("error", "Number of letters must be at least 1.");
    }

    if (numberOfLetters > 1000) {
      return new ReturnObject("error", "Cannot generate more than 1000 letters at once.");
    }

    let result = "";
    for (let i = 0; i < numberOfLetters; i++) {
      result += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }

    return new ReturnObject("success", "Random letters generated.", result);
  };

  // Another example command that replaces the whole text with a random quote
  const random_quote = new Command(
    "random_quote",
    [],
    "insert",
    "Insert a random quote.",
    [
      new TutorialCommand("random_quote", "Insert a random quote.")
    ],
    extensionRoot
  );

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

    return new ReturnObject("success", "Random quote inserted.", result);
  };

  // Another example that opens a URL.
  // If the user's note contains the word "cat", it will open the wikipedia page for cats.
  // Otherwise it will open a random wikipedia page.
  const random_wiki = new Command(
    "random_wiki",
    [],
    "openURL",
    "Open a random Wikipedia page.",
    [
      new TutorialCommand("random_wiki", "Open a random Wikipedia page.")
    ],
    extensionRoot
  );

  random_wiki.execute = function (payload) {
    const url = "https://en.wikipedia.org/wiki/Special:Random";

    return new ReturnObject("success", "Opening random Wikipedia page.", url);
  };
})();
