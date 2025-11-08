# AI Providers Extension

A shared service extension that provides centralized AI provider management for all AI-powered extensions in Antinote.

## Purpose

This extension acts as a **service** - it has no user-facing commands. Instead, it provides a shared API that other extensions can use to access AI capabilities without reimplementing provider logic.

**Benefits:**
- Configure AI providers once, all extensions use the same settings
- Consistent AI behavior across all extensions
- Easy to add new providers (update one place)
- Reduced code duplication

## Supported Providers

- **OpenAI** - GPT models (gpt-4o, gpt-4o-mini, etc.)
- **Anthropic** - Claude models (claude-3-5-sonnet, etc.)
- **Google AI** - Gemini models (gemini-2.0-flash-exp, etc.)
- **OpenRouter** - Unified access to multiple providers
- **Ollama** - Local models (llama3.3, mistral, etc.)

## Setup Instructions

### For Cloud Providers (OpenAI, Anthropic, Google, OpenRouter)

1. Go to **Preferences > API Keys** in Antinote
2. Add API key(s) for your chosen provider(s):
   - **OpenAI**: Keychain Key `apikey_openai`
   - **Anthropic**: Keychain Key `apikey_anthropic`
   - **Google AI**: Keychain Key `apikey_google`
   - **OpenRouter**: Keychain Key `apikey_openrouter`

### For Ollama (Local Models)

1. [Install Ollama](https://ollama.com/download)
2. Pull models: `ollama pull llama3.3`
3. No API key needed

### Configure Defaults

Go to **Preferences > Extensions > AI Providers** and configure:
- **AI Provider** - Choose your default provider
- **Model** - Enter the model name for your provider
- **System Prompt** - Customize the default system prompt
- **Default Max Tokens** - Set default token limit for responses

## For Extension Developers

### Using the AI Providers Service

To use this service in your extension:

#### 1. Declare Dependency

In your `extension.json`, add:
```json
{
  "dependencies": ["ai_providers"]
}
```

#### 2. Call the Service

```javascript
// Simple usage with defaults
var result = callAIProvider("What is the capital of France?");

if (result.status === "success") {
  var aiResponse = result.payload;
  // Use the response...
} else {
  // Handle error
  console.error(result.message);
}
```

#### 3. Override Defaults (Optional)

```javascript
var result = callAIProvider("Translate to Spanish: Hello", {
  provider: "anthropic",        // Override default provider
  model: "claude-3-5-haiku-20241022",  // Override default model
  maxTokens: 100,                // Override default max tokens
  temperature: 0.3,              // Override temperature
  systemPrompt: "You are a translator."  // Override system prompt
});
```

### API Reference

#### `callAIProvider(prompt, options)`

**Parameters:**
- `prompt` (string, required): The user's prompt/question
- `options` (object, optional): Override default settings
  - `provider` (string): Provider ID - "openai", "anthropic", "google", "openrouter", "ollama"
  - `model` (string): Model name
  - `systemPrompt` (string): System prompt for the AI
  - `maxTokens` (number): Maximum tokens (0 = use default from preferences)
  - `temperature` (number): Temperature 0.0-2.0

**Returns:** `ReturnObject`
- `status`: "success" or "error"
- `message`: Human-readable message
- `payload`: AI response text (on success)

### Available Providers

Access provider information via `AI_PROVIDERS`:

```javascript
// List all available providers
for (var id in AI_PROVIDERS) {
  var provider = AI_PROVIDERS[id];
  console.log(provider.name, provider.models);
}
```

## Example Extensions

### Example 1: Summarization Extension

```javascript
var summarize = new Command(
  "summarize",
  [new Parameter("string", "text", "Text to summarize")],
  "replaceLine",
  "Summarize text using AI",
  [],
  extensionRoot
);

summarize.execute = function(payload) {
  var [text] = this.getParsedParams(payload);

  var result = callAIProvider(text, {
    systemPrompt: "Summarize the following text in 1-2 sentences.",
    maxTokens: 100
  });

  return result;
};
```

### Example 2: Translation Extension

```javascript
var translate = new Command(
  "translate",
  [
    new Parameter("string", "text", "Text to translate"),
    new Parameter("string", "lang", "Target language", "Spanish")
  ],
  "insert",
  "Translate text to another language",
  [],
  extensionRoot
);

translate.execute = function(payload) {
  var [text, lang] = this.getParsedParams(payload);

  var result = callAIProvider(text, {
    systemPrompt: "Translate the following text to " + lang + ". Only return the translation.",
    maxTokens: 200
  });

  return result;
};
```

## Privacy

- **Data Scope**: `none` - Only sends prompts explicitly provided by calling extensions
- **Local Option**: Use Ollama for complete privacy (data never leaves your computer)
- **API Keys**: Stored securely in macOS Keychain

## Version

1.0.0

## Author

johnsonfung
