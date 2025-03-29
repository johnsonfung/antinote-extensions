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
