(function () {
  // Dice Rolling Extension (wrapped in IIFE to avoid variable conflicts)
  const extensionName = "dice";

  // Create the extension root with metadata
  const extensionRoot = new Extension({
    name: extensionName,
    version: "1.0.0",
    endpoints: [], // No external API endpoints
    requiredAPIKeys: [], // No API keys required
    author: "Antinote Community",
    category: "Random Generators",
    dataScope: "none" // doesn't need note content
  });

  const roll = new Command({
    name: "roll",
    parameters: [
      new Parameter({type: "string", name: "dieType", helpText: "Type of die to roll (e.g., D6, D20)", default: "D6"}),
      new Parameter({type: "int", name: "numberOfDice", helpText: "Number of dice to roll", default: 1})
    ],
    type: "insert",
    helpText: "Roll dice. Default is one D6. Specify die type (e.g., D20) and optionally the number of dice to roll.",
    tutorials: [
      new TutorialCommand({command: "roll", description: "Roll one D6 (six-sided die)."}),
      new TutorialCommand({command: "roll(D20)", description: "Roll one D20 (twenty-sided die)."}),
      new TutorialCommand({command: "roll(D6, 3)", description: "Roll three D6 dice."}),
      new TutorialCommand({command: "roll(D12, 2)", description: "Roll two D12 dice."}),
      new TutorialCommand({command: "roll(D100, 1)", description: "Roll one D100 (percentile die)."})
    ],
    extension: extensionRoot
  });

  roll.execute = function(payload) {
    const [dieType, numberOfDice] = this.getParsedParams(payload);

    // Parse die type (e.g., "D6", "d20", "6")
    const dieTypeUpper = dieType.toString().toUpperCase();
    let sides;

    // Extract number from die type string
    if (dieTypeUpper.startsWith('D')) {
      sides = parseInt(dieTypeUpper.substring(1));
    } else {
      sides = parseInt(dieTypeUpper);
    }

    // Validation
    if (isNaN(sides) || sides < 2) {
      return new ReturnObject({status: "error", message: "Die type must be at least D2 (e.g., D6, D20)."});
    }

    if (sides > 1000) {
      return new ReturnObject({status: "error", message: "Die type cannot exceed D1000."});
    }

    if (numberOfDice < 1) {
      return new ReturnObject({status: "error", message: "Number of dice must be at least 1."});
    }

    if (numberOfDice > 100) {
      return new ReturnObject({status: "error", message: "Cannot roll more than 100 dice at once."});
    }

    // Roll the dice
    const results = [];
    for (let i = 0; i < numberOfDice; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      results.push(roll);
    }

    // Format output
    const output = results.length === 1 ? results[0].toString() : results.join(", ");

    const message = `Rolled ${numberOfDice} D${sides}${numberOfDice > 1 ? " dice" : " die"}.`;
    return new ReturnObject({status: "success", message, payload: output});
  };
})();
