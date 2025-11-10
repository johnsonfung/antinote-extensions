# 🤖 Building AI & LLM Extensions

This guide shows you how to build AI-powered extensions using Antinote's centralized AI Providers Service.

---

## Why Use the AI Providers Service?

Antinote provides a **centralized AI service** (`ai_providers` extension) that handles all AI/LLM integrations.

### Benefits

✅ **Unified Interface** - Single API works with:
- OpenAI (GPT models)
- Anthropic (Claude models)
- Google AI (Gemini models)
- OpenRouter (multi-provider access)
- Ollama (local models)

✅ **User Configuration** - Users configure their preferred provider and API keys **once**

✅ **No Duplicate Code** - Don't reimplement AI provider logic in each extension

✅ **Centralized Updates** - Provider API changes update all AI extensions automatically

✅ **Better UX** - Consistent AI experience across all extensions

✅ **No API Key Management** - Service handles all authentication

---

## Quick Start

### 1. Declare Dependency

Your extension depends on `ai_providers`:

```js
const extensionRoot = new Extension(
  "my_ai_extension",
  "1.0.0",
  [],                   // No endpoints - ai_providers handles this
  [],                   // No API keys - ai_providers handles this
  "your_github",
  "AI & ML",
  "full",               // Or "line" depending on needs
  ["ai_providers"],     // ⬅️ Declare dependency
  false
);
```

### 2. Check Service Availability

Always check if the service is loaded:

```js
my_command.execute = function(payload) {
  // Check if ai_providers service is available
  if (typeof callAIProvider === 'undefined') {
    return new ReturnObject(
      "error",
      "AI Providers service not available. Please ensure the ai_providers extension is installed and enabled."
    );
  }

  // Your code here...
};
```

### 3. Call the AI Service

```js
my_command.execute = function(payload) {
  if (typeof callAIProvider === 'undefined') {
    return new ReturnObject("error", "AI Providers service not available.");
  }

  const fullText = payload.fullText || "";

  if (!fullText?.trim()) {
    return new ReturnObject("error", "No text to process.");
  }

  // Call AI with your custom prompt
  const result = callAIProvider(fullText, {
    systemPrompt: "Summarize the following text concisely.",
    maxTokens: 200,
    temperature: 0.7
  });

  return result;
};
```

---

## API Reference

### `callAIProvider(prompt, options)`

Sends a prompt to the user's configured AI provider.

**Parameters:**
- `prompt` (string) - The user's input text
- `options` (object, optional) - Configuration options

**Options:**
```js
{
  provider: "openai",        // Override user's default provider
  model: "gpt-4o",           // Override user's default model
  systemPrompt: "You are..", // Custom system/instruction prompt
  maxTokens: 150,            // Max response tokens (0 = use default)
  temperature: 0.7           // Creativity/randomness (0.0-2.0)
}
```

**Returns:** `ReturnObject` with status and AI response

**Available Providers:**
- `"openai"` - OpenAI GPT models
- `"anthropic"` - Anthropic Claude models
- `"google"` - Google Gemini models
- `"openrouter"` - OpenRouter (unified access)
- `"ollama"` - Ollama (local models)

---

## Complete Examples

### Example 1: Text Summarizer

```js
(function() {
  const extensionName = "summarize";

  const extensionRoot = new Extension(
    extensionName,
    "1.0.0",
    [],                   // No endpoints
    [],                   // No API keys
    "your_github",
    "AI & ML",
    "full",               // Needs full text
    ["ai_providers"],     // Depends on AI service
    false
  );

  const summarize = new Command(
    "summarize",
    [
      new Parameter("int", "maxWords", "Maximum words in summary", 100)
    ],
    "replaceAll",
    "Summarize text using AI",
    [
      new TutorialCommand("summarize(50)", "Create a 50-word summary"),
      new TutorialCommand("summarize(200)", "Create a detailed 200-word summary")
    ],
    extensionRoot
  );

  summarize.execute = function(payload) {
    // Check service
    if (typeof callAIProvider === 'undefined') {
      return new ReturnObject("error", "AI Providers service not available.");
    }

    const [maxWords] = this.getParsedParams(payload);
    const fullText = payload.fullText || "";

    if (!fullText?.trim()) {
      return new ReturnObject("error", "No text to summarize.");
    }

    // Call AI
    const result = callAIProvider(fullText, {
      systemPrompt: `Summarize the following text in approximately ${maxWords} words. Be concise and capture the key points.`,
      maxTokens: Math.ceil(maxWords * 1.5),  // Tokens ≈ 0.75 words
      temperature: 0.3  // Lower temp for consistency
    });

    return result;
  };
})();
```

### Example 2: Multi-Level Text Polisher

```js
(function() {
  const extensionName = "polish";

  const extensionRoot = new Extension(
    extensionName,
    "1.0.0",
    [],
    [],
    "your_github",
    "AI & ML",
    "full",
    ["ai_providers"],
    false
  );

  // Add user preference for voice
  const voicePref = new Preference(
    "voice_print",
    "Writing Voice (Optional)",
    "string",
    "",
    null,
    "Describe your writing style to maintain consistency (e.g., 'concise and direct')"
  );
  extensionRoot.register_preference(voicePref);

  const polish = new Command(
    "polish",
    [
      new Parameter("int", "level", "Polish level (1=casual, 2=professional, 3=formal)", 2)
    ],
    "replaceAll",
    "Polish text with AI",
    [
      new TutorialCommand("polish(1)", "Casual, friendly polish"),
      new TutorialCommand("polish(2)", "Professional polish"),
      new TutorialCommand("polish(3)", "Formal, sophisticated polish")
    ],
    extensionRoot
  );

  polish.execute = function(payload) {
    if (typeof callAIProvider === 'undefined') {
      return new ReturnObject("error", "AI Providers service not available.");
    }

    const [level] = this.getParsedParams(payload);
    const fullText = payload.fullText || "";

    if (!fullText?.trim()) {
      return new ReturnObject("error", "No text to polish.");
    }

    // Validate level
    if (level < 1 || level > 3) {
      return new ReturnObject("error", "Level must be 1 (casual), 2 (professional), or 3 (formal).");
    }

    // Define prompts for each level
    const prompts = {
      1: "Polish this text to be clear and casual while maintaining the author's voice. Keep it friendly and approachable.",
      2: "Polish this text to be professional and clear. Improve grammar, structure, and clarity while maintaining a business-appropriate tone.",
      3: "Polish this text to be highly formal and sophisticated. Use precise language, formal structure, and elevated vocabulary."
    };

    let systemPrompt = prompts[level];

    // Add voice print if configured
    const voicePrint = getExtensionPreference(extensionName, "voice_print");
    if (voicePrint?.trim()) {
      systemPrompt += ` Maintain this writing voice: ${voicePrint}`;
    }

    // Call AI
    const result = callAIProvider(fullText, {
      systemPrompt,
      maxTokens: Math.max(fullText.length * 2, 500),  // Scale with input
      temperature: 0.5
    });

    return result;
  };
})();
```

### Example 3: Language Translator

```js
(function() {
  const extensionName = "translate";

  const extensionRoot = new Extension(
    extensionName,
    "1.0.0",
    [],
    [],
    "your_github",
    "AI & ML",
    "full",
    ["ai_providers"],
    false
  );

  // Default language preference
  const langPref = new Preference(
    "default_language",
    "Default Target Language",
    "string",
    "Spanish",
    null,
    "Default language for translation when not specified"
  );
  extensionRoot.register_preference(langPref);

  const translate = new Command(
    "translate",
    [
      new Parameter("string", "language", "Target language (leave empty for default)", "")
    ],
    "replaceAll",
    "Translate text to another language",
    [
      new TutorialCommand("translate(French)", "Translate to French"),
      new TutorialCommand("translate(Japanese)", "Translate to Japanese"),
      new TutorialCommand("translate()", "Translate to default language")
    ],
    extensionRoot
  );

  translate.execute = function(payload) {
    if (typeof callAIProvider === 'undefined') {
      return new ReturnObject("error", "AI Providers service not available.");
    }

    const [language] = this.getParsedParams(payload);
    const fullText = payload.fullText || "";

    if (!fullText?.trim()) {
      return new ReturnObject("error", "No text to translate.");
    }

    // Use default language if not specified
    const targetLang = language?.trim() ||
                       getExtensionPreference(extensionName, "default_language") ||
                       "Spanish";

    // Call AI with translation prompt
    const result = callAIProvider(fullText, {
      systemPrompt: `Translate the following text to ${targetLang}. Return ONLY the translated text, nothing else. Maintain the original formatting and structure.`,
      maxTokens: Math.max(fullText.length * 2, 300),
      temperature: 0.3  // Low temp for accurate translation
    });

    return result;
  };
})();
```

---

## Best Practices

### 1. Choose Appropriate Data Scope

```js
// If processing full document
dataScope: "full"

// If processing just current line
dataScope: "line"

// Never "none" for AI (need text to process)
```

### 2. Validate Input

```js
const fullText = payload.fullText || "";

if (!fullText?.trim()) {
  return new ReturnObject("error", "No text to process.");
}
```

### 3. Scale maxTokens with Input

```js
// Bad - Fixed token limit might truncate long responses
maxTokens: 500

// Good - Scale with input size
maxTokens: Math.max(fullText.length * 2, 500)
```

### 4. Adjust Temperature by Use Case

```js
// Creative writing
temperature: 1.0

// Factual/professional
temperature: 0.3

// Balanced
temperature: 0.7
```

### 5. Clear System Prompts

```js
// Bad - Vague
systemPrompt: "Make it better"

// Good - Specific
systemPrompt: "Polish this text to be professional and clear. Fix grammar and improve structure while maintaining the original meaning."
```

### 6. Add User Preferences

Let users customize behavior:

```js
const promptPref = new Preference(
  "custom_prompt",
  "Custom System Prompt",
  "paragraph",  // Multi-line editor
  "Default prompt here...",
  null,
  "Customize the AI instructions"
);
extensionRoot.register_preference(promptPref);

// Use in command
const customPrompt = getExtensionPreference(extensionName, "custom_prompt");
```

### 7. Handle Errors Gracefully

```js
const result = callAIProvider(text, options);

// The service returns a ReturnObject
// Just return it directly - it handles success/error states
return result;
```

---

## Common Patterns

### Pattern 1: Processing with Levels/Modes

```js
const modes = {
  brief: { prompt: "...", tokens: 100 },
  detailed: { prompt: "...", tokens: 500 },
  comprehensive: { prompt: "...", tokens: 1000 }
};

const config = modes[selectedMode];
const result = callAIProvider(text, {
  systemPrompt: config.prompt,
  maxTokens: config.tokens
});
```

### Pattern 2: Combining User Preferences

```js
const basePrompt = "Summarize this text.";
const tone = getExtensionPreference(extensionName, "tone");
const style = getExtensionPreference(extensionName, "style");

const systemPrompt = `${basePrompt} Use a ${tone} tone and ${style} style.`;
```

### Pattern 3: Context-Aware Processing

```js
const fullText = payload.fullText;
const lineCount = fullText.split('\n').length;

const systemPrompt = lineCount > 50
  ? "This is a long document. Provide a comprehensive summary."
  : "This is a short text. Provide a brief summary.";
```

---

## Testing Your AI Extension

1. **Test without ai_providers enabled**
   - Verify helpful error message appears
   - Extension doesn't crash

2. **Test with different providers**
   - OpenAI, Anthropic, Google, etc.
   - Verify prompts work across providers

3. **Test edge cases**
   - Empty input
   - Very long input
   - Special characters
   - Multiple languages

4. **Test token limits**
   - Ensure maxTokens is reasonable
   - Don't request more than needed

---

## User Setup Instructions

Include these instructions in your extension's README:

```markdown
## Setup

This extension uses Antinote's AI Providers service.

### Prerequisites

1. Make sure the **ai_providers** extension is enabled:
   - Go to **Preferences > Extensions**
   - Find "AI Providers"
   - Ensure it's enabled

2. Configure your AI provider:
   - In **Preferences > Extensions**, click on "AI Providers"
   - Choose your preferred provider (OpenAI, Anthropic, Google, etc.)
   - Select a model
   - Optionally customize system prompt and token limits

3. Add your API key (if not already configured):
   - Go to **Preferences > Extensions > API Keys**
   - Click **Add API Key**
   - For OpenAI:
     - Name: OpenAI
     - Keychain Key: `apikey_openai`
     - API Key Value: Your OpenAI API key
   - For Anthropic:
     - Name: Anthropic
     - Keychain Key: `apikey_anthropic`
     - API Key Value: Your Anthropic API key
   - etc.

That's it! The extension will now use your configured AI provider.
```

---

## Troubleshooting

### "AI Providers service not available"

**Cause**: ai_providers extension not installed or disabled

**Fix**:
1. Go to Preferences > Extensions
2. Ensure "AI Providers" is enabled
3. Reload extensions

### "API key not configured"

**Cause**: User hasn't added API key for their provider

**Fix**:
1. Go to Preferences > Extensions > API Keys
2. Add the appropriate API key (see provider docs)

### Responses getting cut off

**Cause**: maxTokens too low

**Fix**: Increase maxTokens or scale with input:
```js
maxTokens: Math.max(fullText.length * 2, 500)
```

---

## Resources

- [Security Guide](SECURITY.md) - Understanding data scopes and privacy
- [AI Providers Extension](../extensions-official/ai_providers/) - Service source code
- [AI Process Extension](../extensions-official/ai_process/) - Example AI extension
- [Official Extensions](../extensions-official/EXTENSIONS_INDEX.md) - All official extensions

---

Happy AI extension building! 🤖✨
