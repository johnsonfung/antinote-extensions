// AI Providers Extension
// Shared AI provider service for use by other extensions
//
// This extension provides a centralized service for AI provider management.
// Other extensions can depend on this extension to access AI capabilities
// without reimplementing provider logic.
//
// Supported Providers:
// - OpenAI (GPT models)
// - Anthropic (Claude models)
// - Google AI (Gemini models)
// - OpenRouter (unified access to multiple providers)
// - Ollama (local models)
//
// Usage by other extensions:
// 1. Declare dependency on "ai_providers" in extension metadata
// 2. Call: callAIProvider(prompt, options, callback)
//
// This extension has no commands - it only provides a service

(function () {
    const extensionName = "ai_providers";

    // Provider configurations
    const PROVIDERS = {
        "openai": {
            name: "OpenAI",
            endpoint: "https://api.openai.com/v1/chat/completions",
            apiKeyId: "apikey_openai",
            models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
            defaultModel: "gpt-4o",
            requiresApiKey: true
        },
        "anthropic": {
            name: "Anthropic",
            endpoint: "https://api.anthropic.com/v1/messages",
            apiKeyId: "apikey_anthropic",
            models: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
            defaultModel: "claude-3-5-sonnet-20241022",
            requiresApiKey: true
        },
        "google": {
            name: "Google AI",
            endpoint: "https://generativelanguage.googleapis.com/v1beta/models/",
            apiKeyId: "apikey_google",
            models: ["gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash"],
            defaultModel: "gemini-2.0-flash-exp",
            requiresApiKey: true
        },
        "openrouter": {
            name: "OpenRouter",
            endpoint: "https://openrouter.ai/api/v1/chat/completions",
            apiKeyId: "apikey_openrouter",
            models: [
                "anthropic/claude-3.5-sonnet",
                "openai/gpt-4o",
                "google/gemini-2.0-flash-exp:free",
                "meta-llama/llama-3.3-70b-instruct",
                "qwen/qwen-2.5-72b-instruct"
            ],
            defaultModel: "anthropic/claude-3.5-sonnet",
            requiresApiKey: true
        },
        "ollama": {
            name: "Ollama (Local)",
            endpoint: "http://localhost:11434/v1/chat/completions",
            apiKeyId: null,
            models: ["llama3.3", "qwen2.5:32b", "mistral", "phi4", "deepseek-r1:32b"],
            defaultModel: "llama3.3",
            requiresApiKey: false
        }
    };

    // Create the extension root with all possible endpoints and API keys
    const allEndpoints = [];
    const allApiKeys = [];
    for (const providerId in PROVIDERS) {
        const provider = PROVIDERS[providerId];
        allEndpoints.push(provider.endpoint);
        if (provider.requiresApiKey && provider.apiKeyId) {
            allApiKeys.push(provider.apiKeyId);
        }
    }

    const extensionRoot = new Extension({
        name: extensionName,
        version: "1.0.0",
        endpoints: allEndpoints,
        requiredAPIKeys: allApiKeys,
        author: "johnsonfung",
        category: "AI & ML",
        dataScope: "none",
        dependencies: [],      // dependencies
        isService: true     // isService
    });

    // Register shared preferences
    const providerPref = new Preference({
    key: "provider",
    label: "AI Provider",
    type: "selectOne",
    defaultValue: "openai",
    options: ["openai", "anthropic", "google", "openrouter", "ollama"],
    helpText: "Default AI provider for all AI-powered extensions"
  });
    extensionRoot.register_preference(providerPref);

    const modelPref = new Preference({
    key: "model",
    label: "Model",
    type: "string",
    defaultValue: "gpt-4o",
    options: null,
    helpText: "Default model name (depends on provider). See README for available models."
  });
    extensionRoot.register_preference(modelPref);

    const systemPromptPref = new Preference({
    key: "systemPrompt",
    label: "System Prompt",
    type: "string",
    defaultValue: "You are a helpful assistant integrated into a plaintext scratch notes app. Be concise and direct.",
    options: null,
    helpText: "Default system prompt for AI requests"
  });
    extensionRoot.register_preference(systemPromptPref);

    const defaultMaxTokensPref = new Preference({
    key: "defaultMaxTokens",
    label: "Default Max Tokens",
    type: "string",
    defaultValue: "150",
    options: null,
    helpText: "Default maximum tokens for AI responses"
  });
    extensionRoot.register_preference(defaultMaxTokensPref);

    // Helper function to build request for different providers
    const buildRequest = (provider, model, systemPrompt, userPrompt, maxTokens, temperature) => {
        const providerId = provider.toLowerCase();
        const config = PROVIDERS[providerId];

        if (!config) {
            return null;
        }

        let url = config.endpoint;
        let headers = {};
        let body = {};

        if (providerId === "openai" || providerId === "openrouter" || providerId === "ollama") {
            // OpenAI-compatible format (OpenAI, OpenRouter, Ollama)
            headers = {
                "Content-Type": "application/json"
            };

            // Add authorization for providers that require it
            if (providerId !== "ollama") {
                headers["Authorization"] = "Bearer {{API_KEY}}";
            }

            if (providerId === "openrouter") {
                headers["HTTP-Referer"] = "https://antinote.app";
            }

            body = {
                model,
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: userPrompt
                    }
                ],
                max_tokens: maxTokens,
                temperature
            };
        } else if (providerId === "anthropic") {
            // Anthropic format
            headers = {
                "Content-Type": "application/json",
                "x-api-key": "{{API_KEY}}",
                "anthropic-version": "2023-06-01"
            };

            body = {
                model,
                max_tokens: maxTokens,
                temperature,
                system: systemPrompt,
                messages: [
                    {
                        role: "user",
                        content: userPrompt
                    }
                ]
            };
        } else if (providerId === "google") {
            // Google AI format
            url = `${config.endpoint}${model}:generateContent?key={{API_KEY}}`;
            headers = {
                "Content-Type": "application/json"
            };

            body = {
                contents: [
                    {
                        parts: [
                            {
                                text: `${systemPrompt}\n\n${userPrompt}`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens
                }
            };
        }

        return {
            url,
            headers: JSON.stringify(headers),
            body: JSON.stringify(body),
            apiKeyId: config.apiKeyId,
            provider: config
        };
    };

    // Helper function to parse response from different providers
    const parseResponse = (providerId, responseData) => {
        try {
            if (providerId === "openai" || providerId === "openrouter" || providerId === "ollama") {
                if (responseData.choices?.length > 0) {
                    return responseData.choices[0].message.content.trim();
                }
            } else if (providerId === "anthropic") {
                if (responseData.content?.length > 0) {
                    return responseData.content[0].text.trim();
                }
            } else if (providerId === "google") {
                if (responseData.candidates?.length > 0) {
                    const candidate = responseData.candidates[0];
                    if (candidate.content?.parts?.length > 0) {
                        return candidate.content.parts[0].text.trim();
                    }
                }
            }
            return null;
        } catch (e) {
            console.error("Error parsing response:", e);
            return null;
        }
    };

    // Public API: Call AI provider
    // This function is exposed globally for other extensions to use
    //
    // Parameters:
    //   prompt (string): The user's prompt
    //   options (object, optional): Override default settings
    //     - provider: Provider ID ("openai", "anthropic", "google", "openrouter", "ollama")
    //     - model: Model name
    //     - systemPrompt: System prompt
    //     - maxTokens: Maximum tokens (0 = use default)
    //     - temperature: Temperature (0.0-2.0)
    //
    // Returns: ReturnObject with status and response text
    function callAIProvider(prompt, options) {
        try {
            options = options || {};

            // Validation
            if (!prompt || prompt.trim() === "") {
                return new ReturnObject({status: "error", message: "Please provide a prompt."});
            }

            // Get preferences (use options to override)
            const provider = options.provider || getExtensionPreference(extensionName, "provider") || "openai";
            const model = options.model || getExtensionPreference(extensionName, "model") || PROVIDERS[provider].defaultModel;
            const systemPrompt = options.systemPrompt || getExtensionPreference(extensionName, "systemPrompt") || "You are a helpful assistant integrated into a plaintext scratch notes app. Be concise and direct.";
            const defaultMaxTokens = parseInt(getExtensionPreference(extensionName, "defaultMaxTokens") || "150", 10);
            let maxTokens = options.maxTokens !== undefined ? options.maxTokens : defaultMaxTokens;
            const temperature = options.temperature !== undefined ? options.temperature : 0.7;

            // Use default max_tokens if not specified (0 means use default)
            if (maxTokens === 0) {
                maxTokens = defaultMaxTokens;
            }

            // Validate parameters
            if (maxTokens < 1 || maxTokens > 4000) {
                return new ReturnObject({status: "error", message: "maxTokens must be between 1 and 4000."});
            }

            if (temperature < 0 || temperature > 2) {
                return new ReturnObject({status: "error", message: "temperature must be between 0.0 and 2.0."});
            }

            console.log("AI Provider Service - Calling with provider:", provider);
            console.log("AI Provider Service - Using model:", model);

            // Build request for the selected provider
            const request = buildRequest(provider, model, systemPrompt, prompt, maxTokens, temperature);

            if (!request) {
                return new ReturnObject({status: "error", message: `Invalid provider configuration: ${provider}`});
            }

            // Call the API
            let result;
            if (provider === "ollama") {
                // Ollama doesn't need an API key
                result = callAPI(
                    "",
                    request.url,
                    "POST",
                    request.headers,
                    request.body
                );
            } else {
                result = callAPI(
                    request.apiKeyId,
                    request.url,
                    "POST",
                    request.headers,
                    request.body
                );
            }

            console.log("AI Provider Service - API call completed");

            if (!result.success) {
                return new ReturnObject({status: "error", message: `API call failed: ${result.error || "Unknown error"}`});
            }

            // Parse the response
            const responseData = JSON.parse(result.data);

            // Check for API errors
            if (responseData.error) {
                let errorMessage = responseData.error.message || responseData.error;
                if (typeof errorMessage === "object") {
                    errorMessage = JSON.stringify(errorMessage);
                }
                return new ReturnObject({status: "error", message: `API error: ${errorMessage}`});
            }

            // Extract response text based on provider
            const responseText = parseResponse(provider, responseData);

            if (!responseText) {
                return new ReturnObject({status: "error", message: `Could not parse response from ${provider}. Response: ${JSON.stringify(responseData)}`});
            }

            return new ReturnObject({status: "success", message: "AI response generated", payload: responseText});

        } catch (error) {
            console.error("AI Provider Service error:", error);
            return new ReturnObject({status: "error", message: `AI Provider Service error: ${error.toString()}`});
        }
    }

    // Export the service function globally
    // Other extensions can call: callAIProvider(prompt, options)
    if (typeof window !== 'undefined') {
        window.callAIProvider = callAIProvider;
    } else if (typeof global !== 'undefined') {
        global.callAIProvider = callAIProvider;
    }

    // Also export provider info for extensions that want to present custom UI
    if (typeof window !== 'undefined') {
        window.AI_PROVIDERS = PROVIDERS;
    } else if (typeof global !== 'undefined') {
        global.AI_PROVIDERS = PROVIDERS;
    }
})();
