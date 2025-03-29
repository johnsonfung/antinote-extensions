// 1. Name your extension
var extension_name = "random"

var extensionRoot = new Extension(extension_name, "1.0.0");

// 2. Create a command for you extension
var random_number = new Command(
  "random_number", // 3. Name your command

  // 4. Create the parameters for the command. Every parameter must have a type, name, and helpText.
  // type: The type of the parameter. Possible values are "float", "int", "bool", "string"
  // name: The name of the parameter
  // helpText: The help text for the parameter that the user sees
  // default_value: The default value for the parameter
  [
    new Parameter("float", "from", "bottom range", 0),
    new Parameter("float", "to", "top range", 100),
    new Parameter("bool", "int", "round to nearest whole number", true)
  ], 
  ["randnum"], // Set any aliases for the command (max 3)
  "replaceLine", // This is the action the command will do to the user's note: "replaceLine" or "replaceAll" or "openURL"
  "Generate a random number between two values.", // This is the description text for the command
  
  // Give examples of how to use the command. This will show up in the UI.
  [
    new TutorialCommand("random_number", "Generate a random integer between 0 and 100."),
    new TutorialCommand("random_number(10, 20)", "Generate a random integer between 10 and 20."),
    new TutorialCommand("random_number(10, 20, false)", "Generate a random decimal number between 10 and 20.")
  ],
  extensionRoot 
);

// 4. Write your function
random_number.execute = function(payload) {
  // This will automatically replace empty parameters with the default values and parse them based on the parameter type
  var [from, to, int] = this.getParsedParams(payload);

  console.log(from, to, int); // Console logs will appear in Terminal if you launch Antinote from the command line. Starts with 'JS console.log'
  
  var result = Math.random() * (to - from) + from;
  if (int) {
    result = Math.floor(result);
  }

  var success = new ReturnObject("success", "Random number generated.", result);
  return success;
};

// Another example command that generates a series of random letters
var random_letters = new Command(
  "random_letters",
  [
    new Parameter("int", "numberOfLetters", "how many letters you want to return", 1),
  ], 
  [],
  "replaceLine",
  "Generate a random letter or series of letters.",
  [
    new TutorialCommand("random_letters", "Generate a random letter."),
    new TutorialCommand("random_letters(5)", "Generate 5 random letters.")
  ],
  extensionRoot
);

random_letters.execute = function(payload) {
  var [numberOfLetters] = this.getParsedParams(payload);
  
  var result = "";
  for (var i = 0; i < numberOfLetters; i++) {
    result += String.fromCharCode(65 + Math.floor(Math.random() * 26));
  }
  
  var success = new ReturnObject("success", "Random letters generated.", result);
  return success;
};

// Another example command that replaces the whole text with a random quote
var random_quote = new Command(
  "random_quote",
  [],
  [],
  "replaceAll",
  "Replace the whole text with a random quote.",
  [
    new TutorialCommand("random_quote", "Replace the whole text with a random quote.")
  ],
  extensionRoot
);

random_quote.execute = function(payload) {
  var quotes = [
    "Letting go gives us freedom, and freedom is the only condition for happiness.",
    "You can only lose what you cling to.",
    "The foot feels the foot when it feels the ground.",
    "In the end, these things matter most: How well did you love? How fully did you live? How deeply did you let go?",
    "Learning to let go should be learned before learning to get.",
    "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
    "When you let go of what you are, you become what you might be.",
    "To let go is to be free."
  ];
  
  var result = quotes[Math.floor(Math.random() * quotes.length)];
  
  var success = new ReturnObject("success", "Random quote generated.", result);
  return success;
};

// Another example that opens a URL.
// If the user's note contains the word "cat", it will open the wikipedia page for cats. 
// Otherwise it will open a random wikipedia page.
var random_wiki = new Command(
  "random_wiki",
  [],
  [],
  "openURL",
  "Open a random Wikipedia page.",
  [
    new TutorialCommand("random_wiki", "Open a random Wikipedia page.")
  ],
  extensionRoot
);

random_wiki.execute = function(payload) {
  var note = payload.fullText;
  var url = "https://en.wikipedia.org/wiki/Special:Random";
  if (note.includes("cat")) {
    url = "https://en.wikipedia.org/wiki/Cat";
  }

  var success = new ReturnObject("success", "Opening random Wikipedia page.", url);
  return success;
};




