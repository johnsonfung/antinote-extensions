// ===============================
// Antinote Extension: ai_process
// Version 1.0.0
// ===============================

(function() {
  // Wrap in IIFE to avoid variable conflicts
  const extensionName = "ai_process";

  const extensionRoot = new Extension({
    name: extensionName,
    version: "1.0.0",
    endpoints: [], // No endpoints - uses ai_providers
    requiredAPIKeys: [], // No API keys - uses ai_providers
    author: "johnsonfung",
    category: "AI & ML",
    dataScope: "full", // Requires full note content
    dependencies: ["ai_providers"], // dependencies
    isService: false  // isService
  });

  // Register extension preferences

  // Polish command preferences - custom prompts for each professionalism level
  const polishLevel1Pref = new Preference({
    key: "polish_level1_prompt",
    label: "Polish Level 1 Prompt (Casual)",
    type: "paragraph",
    defaultValue: "Polish this text to be clear and casual while maintaining the author's voice. Keep the tone friendly and approachable.",
    options: null,
    helpText: "System prompt for level 1 polish (casual/friendly)"
  });
  extensionRoot.register_preference(polishLevel1Pref);

  const polishLevel2Pref = new Preference({
    key: "polish_level2_prompt",
    label: "Polish Level 2 Prompt (Professional)",
    type: "paragraph",
    defaultValue: "Polish this text to be professional and clear. Improve grammar, structure, and clarity while maintaining a business-appropriate tone.",
    options: null,
    helpText: "System prompt for level 2 polish (professional)"
  });
  extensionRoot.register_preference(polishLevel2Pref);

  const polishLevel3Pref = new Preference({
    key: "polish_level3_prompt",
    label: "Polish Level 3 Prompt (Formal)",
    type: "paragraph",
    defaultValue: "Polish this text to be highly formal and sophisticated. Use precise language, formal structure, and elevated vocabulary appropriate for academic or executive communication.",
    options: null,
    helpText: "System prompt for level 3 polish (formal/sophisticated)"
  });
  extensionRoot.register_preference(polishLevel3Pref);

  const voicePrintPref = new Preference({
    key: "voice_print",
    label: "Voice Print (Optional)",
    type: "paragraph",
    defaultValue: "",
    options: null,
    helpText: "Optional description of your writing voice to maintain consistency when polishing (e.g., 'concise and direct', 'warm and conversational')"
  });
  extensionRoot.register_preference(voicePrintPref);

  // Translation preferences
  const defaultLanguagePref = new Preference({
    key: "default_language",
    label: "Default Translation Language",
    type: "string",
    defaultValue: "Spanish",
    options: null,
    helpText: "Default target language for translation when not specified"
  });
  extensionRoot.register_preference(defaultLanguagePref);

  // Max tokens override
  const maxTokensPref = new Preference({
    key: "max_tokens",
    label: "Max Tokens Override",
    type: "string",
    defaultValue: "",
    options: null,
    helpText: "Override max tokens for AI responses (leave empty to use ai_providers default)"
  });
  extensionRoot.register_preference(maxTokensPref);

  // ===========================
  // POLISH COMMAND
  // ===========================

  const polish = new Command({
    name: "polish",
    parameters: [
      new Parameter({type: "int", name: "level", helpText: "Professionalism level (1=casual, 2=professional, 3=formal)", default: 2})
    ],
    type: "replaceAll",
    helpText: "Polish text with AI to improve professionalism and clarity",
    tutorials: [
      new TutorialCommand({command: "polish(1)", description: "Polish text with casual, friendly tone"}),
      new TutorialCommand({command: "polish(2)", description: "Polish text with professional tone (default)"}),
      new TutorialCommand({command: "polish(3)", description: "Polish text with formal, sophisticated tone"})
    ],
    extension: extensionRoot
  });

  polish.execute = function(payload) {
    // Check if ai_providers service is available
    if (typeof callAIProvider === 'undefined') {
      return new ReturnObject({status: "error", message: "AI Providers service not available. The ai_process extension requires the ai_providers extension to be installed and enabled."});
    }

    const params = this.getParsedParams(payload);
    const level = params[0];
    const fullText = payload.fullText || "";

    // Validate level
    if (level < 1 || level > 3) {
      return new ReturnObject({status: "error", message: "Level must be 1, 2, or 3 (1=casual, 2=professional, 3=formal)"});
    }

    if (!fullText || fullText.trim() === "") {
      return new ReturnObject({status: "error", message: "No text to polish. The note appears to be empty."});
    }

    // Get the appropriate prompt for the level
    const promptKey = `polish_level${level}_prompt`;
    let systemPrompt = getExtensionPreference(extensionName, promptKey);

    // Add voice print if configured
    const voicePrint = getExtensionPreference(extensionName, "voice_print");
    if (voicePrint?.trim()) {
      systemPrompt += ` Maintain this voice: ${voicePrint}`;
    }

    // Get max tokens override if set
    const maxTokensOverride = getExtensionPreference(extensionName, "max_tokens");
    const options = {
      systemPrompt
    };

    if (maxTokensOverride?.trim()) {
      options.maxTokens = parseInt(maxTokensOverride, 10);
    }

    // Call AI provider
    const result = callAIProvider(fullText, options);

    return result;
  };

  // ===========================
  // TRANSLATE COMMAND
  // ===========================

  const translate = new Command({
    name: "translate",
    parameters: [
      new Parameter({type: "string", name: "language", helpText: "Target language for translation", default: ""})
    ],
    type: "replaceAll",
    helpText: "Translate text to another language using AI",
    tutorials: [
      new TutorialCommand({command: "translate(French)", description: "Translate text to French"}),
      new TutorialCommand({command: "translate(Japanese)", description: "Translate text to Japanese"}),
      new TutorialCommand({command: "translate()", description: "Translate to default language (from preferences)"})
    ],
    extension: extensionRoot
  });

  translate.execute = function(payload) {
    // Check if ai_providers service is available
    if (typeof callAIProvider === 'undefined') {
      return new ReturnObject({status: "error", message: "AI Providers service not available. The ai_process extension requires the ai_providers extension to be installed and enabled."});
    }

    const params = this.getParsedParams(payload);
    let language = params[0] || "";
    const fullText = payload.fullText || "";

    if (!fullText || fullText.trim() === "") {
      return new ReturnObject({status: "error", message: "No text to translate. The note appears to be empty."});
    }

    // Use default language if not specified
    if (!language?.trim()) {
      language = getExtensionPreference(extensionName, "default_language") || "Spanish";
    }

    // Build system prompt
    const systemPrompt = `Translate the following text to ${language}. Only return the translated text, nothing else.`;

    // Get max tokens override if set
    const maxTokensOverride = getExtensionPreference(extensionName, "max_tokens");
    const options = {
      systemPrompt
    };

    if (maxTokensOverride?.trim()) {
      options.maxTokens = parseInt(maxTokensOverride, 10);
    }

    // Call AI provider
    const result = callAIProvider(fullText, options);

    return result;
  };

  // ===========================
  // CREATE_LIST COMMAND
  // ===========================

  const create_list = new Command({
    name: "create_list",
    parameters: [],
    type: "replaceAll",
    helpText: "Generate a structured list from text using AI",
    tutorials: [
      new TutorialCommand({command: "create_list()", description: "Convert text into a structured list"})
    ],
    extension: extensionRoot
  });

  create_list.execute = function(payload) {
    // Check if ai_providers service is available
    if (typeof callAIProvider === 'undefined') {
      return new ReturnObject({status: "error", message: "AI Providers service not available. The ai_process extension requires the ai_providers extension to be installed and enabled."});
    }

    const fullText = payload.fullText || "";

    if (!fullText || fullText.trim() === "") {
      return new ReturnObject({status: "error", message: "No text to process. The note appears to be empty."});
    }

    // Build system prompt with specific formatting instructions
    const systemPrompt = "Convert the following text into a structured list. " +
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
    const maxTokensOverride = getExtensionPreference(extensionName, "max_tokens");
    const options = {
      systemPrompt
    };

    if (maxTokensOverride?.trim()) {
      options.maxTokens = parseInt(maxTokensOverride, 10);
    }

    // Call AI provider
    const result = callAIProvider(fullText, options);

    return result;
  };

})();
