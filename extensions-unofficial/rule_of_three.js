var extensionRoot = new Extension("rule_of_three", "1.0.0");

var thirds = new Command(
  "three",

  [
    new Parameter("string", "ref1", "Reference 1", "1"),
    new Parameter("string", "ref2", "Reference 2", "1"),
    new Parameter("string", "req1", "Required 1", "1"),
    new Parameter("string", "req2", "Required 2", "1"),
    new Parameter("boolean", "logic", "Add rule of three logic", false)
  ],

  ["rule_of_three"],

  "replaceLine",

  "Compute rule of three, either req1 or req2 must be set to 'x'. If you set the last parameter to true, a nice diagram will be outputed.",

  [
    new TutorialCommand("three(5, 10, 1, x)", "Compute rule of three for x on the right."),
    new TutorialCommand("three(5, 10, x, 2)", "Compute rule of three for x on the left."),
    new TutorialCommand("three(5, 10, x, 2, true)", "Compute rule of three for x on the left, and show the rule of three logic."),
    new TutorialCommand("three(5L, 10m^3, x, 2m^3)", "Compute rule of thirds with units."),
    new TutorialCommand("three(5L, 10m^3, x, 2m^3, true)", "Compute rule of thirds with units, and show the rule of three logic.")
  ],

  extensionRoot
);

thirds.execute = function(payload) {
  var [ref1, ref2, req1, req2, logic] = this.getParsedParams(payload);
  logic = logic == "true"

  if (req1 == "x" && req2 == "x") {
    return new ReturnObject("error", "Only one parameter must be 'x'");
  }
  if (req1 != "x" && req2 != "x") {
    return new ReturnObject("error", "Either the 3rd of 4rd parameter must be 'x'");
  }
  if (ref1 == "x" || ref2 == "x") {
    return new ReturnObject("error", "The first 2 parameters must not be 'x'");
  }

  const unitSep = /^(\d+)(.*)$/

  const values = []

  const leftUnit = ref1.match(unitSep)[2]
  const rightUnit = ref2.match(unitSep)[2]

  values[0] = parseFloat(ref1.match(unitSep)[1])
  values[1] = parseFloat(ref2.match(unitSep)[1])

  var out;

  /*
  0 - 1
  2 - 3
  */

  if (req1 == "x") {
    values[3] = parseFloat(req2.match(unitSep)[1])
    values[2] = parseFloat(values[3]*values[0]/values[1])

    if (logic) {
      out = `${ref1} - ${ref2}\nx: ${values[2]}${leftUnit} - ${req2}`
    } else {
      out = values[2] + leftUnit
    }
  } else {
    values[2] = parseFloat(req1.match(unitSep)[1])
    values[3] = parseFloat(values[2]*values[1]/values[0])

    if (logic) {
      out = `${ref1} - ${ref2}\n${req1} - x: ${values[3]}${rightUnit}`
    } else {
      out = values[3] + rightUnit
    }
  }

  return new ReturnObject("success", "Rule of three calculated.", out);
};