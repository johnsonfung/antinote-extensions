var randomExt = new Extension("random_number");

// Create a command that generates a random number
var random_number = new Command(
  "random_number", 
  [
    new Parameter("float", "from", "bottom range", 0),
    new Parameter("float", "to", "top range", 100),
    new Parameter("bool", "int", "return integer", true)
  ], 
  [], 
  "replaceLine", // This is the action the command will do: "replaceLine" or "replaceAll" or "openURL"
  "Generate a random number between two values.",
  randomExt
);

// Override the execute method for this command to accept arguments.
random_number.execute = function(payload) {
  var [from, to, int] = this.getResolvedParams(payload);

  var min = parseFloat(from);
  var max = parseFloat(to);
  var isInt = Boolean(int);

  var result = Math.random() * (max - min) + min;
  if (isInt) {
    result = Math.floor(result);
  }

  return result;
};