// ===============================
// Antinote Extension: ai_process
// Version 1.0.0
// ===============================

(function() {
  // Wrap in IIFE to avoid variable conflicts
  const extensionName = "ai_process";

  const extensionRoot = new Extension({
    name: extensionName,
    version: "1.0.6",
    endpoints: [], // No endpoints - uses ai_providers
    requiredAPIKeys: [], // No API keys - uses ai_providers
    author: "johnsonfung",
    category: "AI & ML",
    dataScope: "full", // Requires full note content
    dependencies: ["ai_providers"], // dependencies
    isService: false  // isService
  });

  // Register extension preferences

  // Polish command preferences - custom prompts for each level
  const polishLevel1Pref = new Preference({
    key: "polish_level1_prompt",
    label: "Polish Level 1 Prompt (Typos & Grammar)",
    type: "paragraph",
    defaultValue: "Fix clear typos, spelling mistakes, and grammar errors in this text. Make minimal changes - only correct obvious mistakes while preserving the original wording and style.",
    options: null,
    helpText: "System prompt for level 1 polish (typos, spelling, grammar fixes only)"
  });
  extensionRoot.register_preference(polishLevel1Pref);

  const polishLevel2Pref = new Preference({
    key: "polish_level2_prompt",
    label: "Polish Level 2 Prompt (Work Email)",
    type: "paragraph",
    defaultValue: "Polish this text for clarity and structure, suitable for a work email. Fix grammar and spelling, improve sentence structure, and organize the content clearly while keeping it concise and professional.",
    options: null,
    helpText: "System prompt for level 2 polish (structured like a work email)"
  });
  extensionRoot.register_preference(polishLevel2Pref);

  const polishLevel3Pref = new Preference({
    key: "polish_level3_prompt",
    label: "Polish Level 3 Prompt (Work Speech)",
    type: "paragraph",
    defaultValue: "Elaborate and polish this text for a longer format like a work speech or presentation. Expand on key points, add appropriate transitions, and structure the content for verbal delivery while maintaining a professional and engaging tone.",
    options: null,
    helpText: "System prompt for level 3 polish (elaborated like a work speech)"
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
      new Parameter({type: "int", name: "level", helpText: "Polish level (1=typos/grammar, 2=work email, 3=work speech)", default: 1, required: false})
    ],
    type: "replaceAll",
    helpText: "Polish text with AI at different levels of refinement",
    tutorials: [
      new TutorialCommand({command: "polish(1)", description: "Fix typos, spelling, and grammar only (default)"}),
      new TutorialCommand({command: "polish(2)", description: "Structure for clarity like a work email"}),
      new TutorialCommand({command: "polish(3)", description: "Elaborate for longer format like a work speech"})
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
      return new ReturnObject({status: "error", message: "Level must be 1, 2, or 3 (1=typos/grammar, 2=work email, 3=work speech)"});
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
      new Parameter({type: "string", name: "language", helpText: "Target language for translation", default: "Spanish", required: false})
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
