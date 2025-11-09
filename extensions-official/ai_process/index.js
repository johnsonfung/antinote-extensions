// ===============================
// Antinote Extension: ai_process
// Version 1.0.0
// ===============================

(function() {
  // Wrap in IIFE to avoid variable conflicts
  var extensionName = "ai_process";

  var extensionRoot = new Extension(
    extensionName,
    "1.0.0",
    [], // No endpoints - uses ai_providers
    [], // No API keys - uses ai_providers
    "johnsonfung",
    "AI & ML",
    "full", // Requires full note content
    ["ai_providers"], // dependencies
    false  // isService
  );

  // Register extension preferences

  // Polish command preferences - custom prompts for each professionalism level
  var polishLevel1Pref = new Preference(
    "polish_level1_prompt",
    "Polish Level 1 Prompt (Casual)",
    "string",
    "Polish this text to be clear and casual while maintaining the author's voice. Keep the tone friendly and approachable.",
    null,
    "System prompt for level 1 polish (casual/friendly)"
  );
  extensionRoot.register_preference(polishLevel1Pref);

  var polishLevel2Pref = new Preference(
    "polish_level2_prompt",
    "Polish Level 2 Prompt (Professional)",
    "string",
    "Polish this text to be professional and clear. Improve grammar, structure, and clarity while maintaining a business-appropriate tone.",
    null,
    "System prompt for level 2 polish (professional)"
  );
  extensionRoot.register_preference(polishLevel2Pref);

  var polishLevel3Pref = new Preference(
    "polish_level3_prompt",
    "Polish Level 3 Prompt (Formal)",
    "string",
    "Polish this text to be highly formal and sophisticated. Use precise language, formal structure, and elevated vocabulary appropriate for academic or executive communication.",
    null,
    "System prompt for level 3 polish (formal/sophisticated)"
  );
  extensionRoot.register_preference(polishLevel3Pref);

  var voicePrintPref = new Preference(
    "voice_print",
    "Voice Print (Optional)",
    "string",
    "",
    null,
    "Optional description of your writing voice to maintain consistency when polishing (e.g., 'concise and direct', 'warm and conversational')"
  );
  extensionRoot.register_preference(voicePrintPref);

  // Translation preferences
  var defaultLanguagePref = new Preference(
    "default_language",
    "Default Translation Language",
    "string",
    "Spanish",
    null,
    "Default target language for translation when not specified"
  );
  extensionRoot.register_preference(defaultLanguagePref);

  // Max tokens override
  var maxTokensPref = new Preference(
    "max_tokens",
    "Max Tokens Override",
    "string",
    "",
    null,
    "Override max tokens for AI responses (leave empty to use ai_providers default)"
  );
  extensionRoot.register_preference(maxTokensPref);

  // ===========================
  // POLISH COMMAND
  // ===========================

  var polish = new Command(
    "polish",
    [
      new Parameter("int", "level", "Professionalism level (1=casual, 2=professional, 3=formal)", 2)
    ],
    "replaceAll",
    "Polish text with AI to improve professionalism and clarity",
    [
      new TutorialCommand("polish(1)", "Polish text with casual, friendly tone"),
      new TutorialCommand("polish(2)", "Polish text with professional tone (default)"),
      new TutorialCommand("polish(3)", "Polish text with formal, sophisticated tone")
    ],
    extensionRoot
  );

  polish.execute = function(payload) {
    // Check if ai_providers service is available
    if (typeof callAIProvider === 'undefined') {
      return new ReturnObject("error", "AI Providers service not available. The ai_process extension requires the ai_providers extension to be installed and enabled.");
    }

    var params = this.getParsedParams(payload);
    var level = params[0];
    var fullText = payload.fullText || "";

    // Validate level
    if (level < 1 || level > 3) {
      return new ReturnObject("error", "Level must be 1, 2, or 3 (1=casual, 2=professional, 3=formal)");
    }

    if (!fullText || fullText.trim() === "") {
      return new ReturnObject("error", "No text to polish. The note appears to be empty.");
    }

    // Get the appropriate prompt for the level
    var promptKey = "polish_level" + level + "_prompt";
    var systemPrompt = getExtensionPreference(extensionName, promptKey);

    // Add voice print if configured
    var voicePrint = getExtensionPreference(extensionName, "voice_print");
    if (voicePrint && voicePrint.trim() !== "") {
      systemPrompt += " Maintain this voice: " + voicePrint;
    }

    // Get max tokens override if set
    var maxTokensOverride = getExtensionPreference(extensionName, "max_tokens");
    var options = {
      systemPrompt: systemPrompt
    };

    if (maxTokensOverride && maxTokensOverride.trim() !== "") {
      options.maxTokens = parseInt(maxTokensOverride, 10);
    }

    // Call AI provider
    var result = callAIProvider(fullText, options);

    return result;
  };

  // ===========================
  // TRANSLATE COMMAND
  // ===========================

  var translate = new Command(
    "translate",
    [
      new Parameter("string", "language", "Target language for translation", "")
    ],
    "replaceAll",
    "Translate text to another language using AI",
    [
      new TutorialCommand("translate(French)", "Translate text to French"),
      new TutorialCommand("translate(Japanese)", "Translate text to Japanese"),
      new TutorialCommand("translate()", "Translate to default language (from preferences)")
    ],
    extensionRoot
  );

  translate.execute = function(payload) {
    // Check if ai_providers service is available
    if (typeof callAIProvider === 'undefined') {
      return new ReturnObject("error", "AI Providers service not available. The ai_process extension requires the ai_providers extension to be installed and enabled.");
    }

    var params = this.getParsedParams(payload);
    var language = params[0] || "";
    var fullText = payload.fullText || "";

    if (!fullText || fullText.trim() === "") {
      return new ReturnObject("error", "No text to translate. The note appears to be empty.");
    }

    // Use default language if not specified
    if (!language || language.trim() === "") {
      language = getExtensionPreference(extensionName, "default_language") || "Spanish";
    }

    // Build system prompt
    var systemPrompt = "Translate the following text to " + language + ". Only return the translated text, nothing else.";

    // Get max tokens override if set
    var maxTokensOverride = getExtensionPreference(extensionName, "max_tokens");
    var options = {
      systemPrompt: systemPrompt
    };

    if (maxTokensOverride && maxTokensOverride.trim() !== "") {
      options.maxTokens = parseInt(maxTokensOverride, 10);
    }

    // Call AI provider
    var result = callAIProvider(fullText, options);

    return result;
  };

  // ===========================
  // CREATE_LIST COMMAND
  // ===========================

  var create_list = new Command(
    "create_list",
    [],
    "replaceAll",
    "Generate a structured list from text using AI",
    [
      new TutorialCommand("create_list()", "Convert text into a structured list")
    ],
    extensionRoot
  );

  create_list.execute = function(payload) {
    // Check if ai_providers service is available
    if (typeof callAIProvider === 'undefined') {
      return new ReturnObject("error", "AI Providers service not available. The ai_process extension requires the ai_providers extension to be installed and enabled.");
    }

    var fullText = payload.fullText || "";

    if (!fullText || fullText.trim() === "") {
      return new ReturnObject("error", "No text to process. The note appears to be empty.");
    }

    // Build system prompt with specific formatting instructions
    var systemPrompt = "Convert the following text into a structured list. " +
      "Format your response EXACTLY as follows:\n" +
      "- First line: 'list:' followed by a concise title for the list\n" +
      "- Following lines: Each list item on its own line with no bullets, dashes, or numbers\n" +
      "- Do not include any other formatting or explanatory text\n\n" +
      "Example format:\n" +
      "list:Shopping Items\n" +
      "Milk\n" +
      "Bread\n" +
      "Eggs";

    // Get max tokens override if set
    var maxTokensOverride = getExtensionPreference(extensionName, "max_tokens");
    var options = {
      systemPrompt: systemPrompt
    };

    if (maxTokensOverride && maxTokensOverride.trim() !== "") {
      options.maxTokens = parseInt(maxTokensOverride, 10);
    }

    // Call AI provider
    var result = callAIProvider(fullText, options);

    return result;
  };

})();
