(function () {
  // Dice Rolling Extension (wrapped in IIFE to avoid variable conflicts)
  const extensionName = "dice";

  // Create the extension root with metadata
  const extensionRoot = new Extension({
    name: extensionName,
    version: "1.0.6",
    endpoints: [], // No external API endpoints
    requiredAPIKeys: [], // No API keys required
    author: "Antinote Community",
    category: "Random Generators",
    dataScope: "none" // doesn't need note content
  });

  const roll = new Command({
    name: "roll",
    parameters: [
      new Parameter({type: "string", name: "dice", helpText: "Dice to roll (e.g., 20, d20, 4d20)", default: "d6", required: false})
    ],
    type: "insert",
    helpText: "Roll dice. Accepts number (20), die notation (d20), or multiple dice (4d20). Default is d6.",
    tutorials: [
      new TutorialCommand({command: "roll", description: "Roll one D6 (six-sided die)."}),
      new TutorialCommand({command: "roll(20)", description: "Roll one D20 (twenty-sided die)."}),
      new TutorialCommand({command: "roll(d20)", description: "Roll one D20 (twenty-sided die)."}),
      new TutorialCommand({command: "roll(4d6)", description: "Roll four D6 dice."})
    ],
    extension: extensionRoot
  });

  roll.execute = function(payload) {
    const [diceParam] = this.getParsedParams(payload);
    const input = diceParam.toString().toLowerCase().trim();

    let numberOfDice = 1;
    let sides;

    // Parse the input format
    // Formats: "20" (just number), "d20" (die notation), "4d20" (multiple dice notation)
    const diceNotationMatch = input.match(/^(\d+)?d(\d+)$/);
    const plainNumberMatch = input.match(/^(\d+)$/);

    if (diceNotationMatch) {
      // Format: "d20" or "4d20"
      numberOfDice = diceNotationMatch[1] ? parseInt(diceNotationMatch[1]) : 1;
      sides = parseInt(diceNotationMatch[2]);
    } else if (plainNumberMatch) {
      // Format: "20" (just the number of sides)
      sides = parseInt(plainNumberMatch[1]);
    } else {
      return new ReturnObject({status: "error", message: "Invalid format. Use number (20), die notation (d20), or multiple dice (4d20)."});
    }

    // Validation
    if (isNaN(sides) || sides < 2) {
      return new ReturnObject({status: "error", message: "Die must have at least 2 sides."});
    }

    if (sides > 1000) {
      return new ReturnObject({status: "error", message: "Die cannot exceed 1000 sides."});
    }

    if (numberOfDice < 1) {
      return new ReturnObject({status: "error", message: "Must roll at least 1 die."});
    }

    if (numberOfDice > 100) {
      return new ReturnObject({status: "error", message: "Cannot roll more than 100 dice at once."});
    }

    // Roll the dice
    const results = [];
    for (let i = 0; i < numberOfDice; i++) {
      const rollResult = Math.floor(Math.random() * sides) + 1;
      results.push(rollResult);
    }

    // Format output
    const total = results.reduce((sum, val) => sum + val, 0);
    let output;
    if (results.length === 1) {
      output = results[0].toString();
    } else {
      output = `${results.join(" + ")} = ${total}`;
    }

    const message = `Rolled ${numberOfDice}d${sides}.`;
    return new ReturnObject({status: "success", message, payload: output});
  };
})();
