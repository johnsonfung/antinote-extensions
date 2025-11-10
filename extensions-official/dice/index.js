(function () {
  // Dice Rolling Extension (wrapped in IIFE to avoid variable conflicts)
  const extensionName = "dice";

  // Create the extension root with metadata
  const extensionRoot = new Extension(
    extensionName,
    "1.0.0",
    [], // No external API endpoints
    [], // No API keys required
    "Antinote Community", // Author
    "Random Generators", // Category
    "none" // Data scope: doesn't need note content
  );

  const roll = new Command(
    "roll",
    [
      new Parameter("string", "dieType", "Type of die to roll (e.g., D6, D20)", "D6"),
      new Parameter("int", "numberOfDice", "Number of dice to roll", 1)
    ],
    "insert",
    "Roll dice. Default is one D6. Specify die type (e.g., D20) and optionally the number of dice to roll.",
    [
      new TutorialCommand("roll", "Roll one D6 (six-sided die)."),
      new TutorialCommand("roll(D20)", "Roll one D20 (twenty-sided die)."),
      new TutorialCommand("roll(D6, 3)", "Roll three D6 dice."),
      new TutorialCommand("roll(D12, 2)", "Roll two D12 dice."),
      new TutorialCommand("roll(D100, 1)", "Roll one D100 (percentile die).")
    ],
    extensionRoot
  );

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
      return new ReturnObject("error", "Die type must be at least D2 (e.g., D6, D20).");
    }

    if (sides > 1000) {
      return new ReturnObject("error", "Die type cannot exceed D1000.");
    }

    if (numberOfDice < 1) {
      return new ReturnObject("error", "Number of dice must be at least 1.");
    }

    if (numberOfDice > 100) {
      return new ReturnObject("error", "Cannot roll more than 100 dice at once.");
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
    return new ReturnObject("success", message, output);
  };
})();
