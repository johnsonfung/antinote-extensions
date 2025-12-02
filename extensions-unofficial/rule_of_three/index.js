(function() {
  // Wrap in IIFE to avoid variable conflicts
  var extensionName = "rule_of_three";

  var extensionRoot = new Extension({
    name: extensionName,
    version: "1.0.4",
    endpoints: [], // No external API endpoints
    requiredAPIKeys: [],  // No API keys required
    author: "johnsonfung",  // Author (GitHub username)
    category: "Math",  // Category
    dataScope: "none"  // Data scope: "none", "line", or "full" - doesn't need note content
  });

  var three = new Command({
    name: "three",
    parameters: [
      new Parameter({type: "string", name: "ref1", helpText: "Reference 1", default: "5", required: true}),
      new Parameter({type: "string", name: "ref2", helpText: "Reference 2", default: "10", required: true}),
      new Parameter({type: "string", name: "req1", helpText: "Required 1", default: "1", required: true}),
      new Parameter({type: "string", name: "req2", helpText: "Required 2", default: "x", required: true}),
      new Parameter({type: "bool", name: "logic", helpText: "Add rule of three logic", default: false, required: false})
    ],
    type: "replaceLine",
    helpText: "Compute rule of three, either req1 or req2 must be set to 'x'. If you set the last parameter to true, a nice diagram will be outputed.",
    tutorials: [
      new TutorialCommand({command: "three(5, 10, 1, x)", description: "Compute rule of three for x on the right."}),
      new TutorialCommand({command: "three(5, 10, x, 2)", description: "Compute rule of three for x on the left."}),
      new TutorialCommand({command: "three(5, 10, x, 2, true)", description: "Compute rule of three for x on the left, and show the rule of three logic."}),
      new TutorialCommand({command: "three(5L, 10m^3, x, 2m^3)", description: "Compute rule of thirds with units."}),
      new TutorialCommand({command: "three(5L, 10m^3, x, 2m^3, true)", description: "Compute rule of thirds with units, and show the rule of three logic."})
    ],
    extension: extensionRoot
  });

  three.execute = function(payload) {
    var [ref1, ref2, req1, req2, logic] = this.getParsedParams(payload);

    if (req1 == "x" && req2 == "x") {
      return new ReturnObject({status: "error", message: "Only one parameter must be 'x'"});
    }
    if (req1 != "x" && req2 != "x") {
      return new ReturnObject({status: "error", message: "Either the 3rd or 4th parameter must be 'x'"});
    }
    if (ref1 == "x" || ref2 == "x") {
      return new ReturnObject({status: "error", message: "The first 2 parameters must not be 'x'"});
    }

    var unitSep = /^(\d*\.\d+|\d+)(\s*.*)?$/;

    var values = [];

    var leftUnit = ref1.match(unitSep)[2] || "";
    var rightUnit = ref2.match(unitSep)[2] || "";

    values[0] = parseFloat(ref1.match(unitSep)[1]);
    values[1] = parseFloat(ref2.match(unitSep)[1]);

    var out;

    /*
    0 - 1
    2 - 3
    */

    if (req1 == "x") {
      values[3] = parseFloat(req2.match(unitSep)[1]);
      values[2] = parseFloat(values[3] * values[0] / values[1]);

      if (logic) {
        out = ref1 + " - " + ref2 + "\nx: " + values[2] + leftUnit + " - " + req2;
      } else {
        out = values[2] + leftUnit;
      }
    } else {
      values[2] = parseFloat(req1.match(unitSep)[1]);
      values[3] = parseFloat(values[2] * values[1] / values[0]);

      if (logic) {
        out = ref1 + " - " + ref2 + "\n" + req1 + " - x: " + values[3] + rightUnit;
      } else {
        out = values[3] + rightUnit;
      }
    }

    return new ReturnObject({status: "success", message: "Rule of three calculated.", payload: out});
  };
})();
