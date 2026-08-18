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

    // Response length is asked for in the prompt rather than enforced with a
    // token cap: a hard cap truncates mid-sentence, and on reasoning models
    // (Gemini 2.5, o-series) a small cap is spent thinking and the reply comes
    // back empty. Only Anthropic needs a number, because its API requires one.
    const ANTHROPIC_MAX_TOKENS = 8192;

    // Provider configurations
    // `models` seeds the model list before the app's live catalog is available;
    // `modelPrefixes` identifies models that belong to this provider, so a model
    // left over from a different provider is never sent.
    const PROVIDERS = {
        "openai": {
            name: "OpenAI",
            endpoint: "https://api.openai.com/v1/chat/completions",
            apiKeyId: "apikey_openai",
            models: ["gpt-5", "gpt-5-mini", "gpt-4.1", "gpt-4o", "gpt-4o-mini"],
            defaultModel: "gpt-5",
            modelPrefixes: ["gpt-", "o1", "o3", "o4", "chatgpt"],
            requiresApiKey: true
        },
        "anthropic": {
            name: "Anthropic",
            endpoint: "https://api.anthropic.com/v1/messages",
            apiKeyId: "apikey_anthropic",
            models: ["claude-opus-5", "claude-sonnet-5", "claude-haiku-4-5"],
            defaultModel: "claude-sonnet-5",
            modelPrefixes: ["claude"],
            requiresApiKey: true
        },
        "google": {
            name: "Google AI",
            endpoint: "https://generativelanguage.googleapis.com/v1beta/models/",
            apiKeyId: "apikey_google",
            models: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5-flash-lite"],
            defaultModel: "gemini-2.5-flash",
            modelPrefixes: ["gemini", "gemma"],
            requiresApiKey: true
        },
        "openrouter": {
            name: "OpenRouter",
            endpoint: "https://openrouter.ai/api/v1/chat/completions",
            apiKeyId: "apikey_openrouter",
            models: [
                "openrouter/auto",
                "anthropic/claude-sonnet-5",
                "openai/gpt-5",
                "google/gemini-2.5-flash",
                "meta-llama/llama-3.3-70b-instruct"
            ],
            defaultModel: "openrouter/auto",
            // OpenRouter model ids are "vendor/model", so there is no prefix to
            // check — an unknown model is left alone.
            modelPrefixes: [],
            requiresApiKey: true
        },
        "ollama": {
            name: "Ollama (Local)",
            endpoint: "http://localhost:11434/v1/chat/completions",
            apiKeyId: null,
            models: ["llama3.3", "qwen2.5:32b", "mistral", "phi4", "deepseek-r1:32b"],
            defaultModel: "llama3.3",
            modelPrefixes: [],
            requiresApiKey: false
        }
    };

    // How much text to ask for, in words rather than tokens — the model reads
    // this, so it stops on a sentence boundary instead of mid-word.
    const RESPONSE_LENGTHS = {
        "brief": "Keep your answer to a couple of sentences at most.",
        "standard": "Keep your answer under roughly 150 words unless the request clearly needs more.",
        "detailed": "Answer as fully as the request needs, up to roughly 600 words."
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
        version: "1.1.0",
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
    defaultValue: "",
    options: null,
    helpText: "Leave empty to use the provider's current default. Antinote keeps the list of available models up to date from each provider."
  });
    extensionRoot.register_preference(modelPref);

    const systemPromptPref = new Preference({
    key: "systemPrompt",
    label: "System Prompt",
    type: "paragraph",
    defaultValue: "You are a helpful assistant integrated into a plaintext scratch notes app. Be concise and direct.",
    options: null,
    helpText: "Default system prompt for AI requests"
  });
    extensionRoot.register_preference(systemPromptPref);

    const responseLengthPref = new Preference({
    key: "responseLength",
    label: "Response Length",
    type: "selectOne",
    defaultValue: "standard",
    options: ["brief", "standard", "detailed"],
    helpText: "How long responses should be. This is asked for in the prompt, so answers finish their last sentence instead of being cut off."
  });
    extensionRoot.register_preference(responseLengthPref);

    const timeoutPref = new Preference({
    key: "timeout",
    label: "Request Timeout (seconds)",
    type: "string",
    defaultValue: "60",
    options: null,
    helpText: "Maximum time to wait for AI response before timing out (in seconds)"
  });
    extensionRoot.register_preference(timeoutPref);

    // The models a provider currently offers, from the app's cached catalog.
    // Older Antinote versions don't expose the bridge, so this may be empty —
    // everything below treats an empty list as "unknown", never as "none".
    const availableModels = (providerId) => {
        if (typeof getAvailableModels !== "function") {
            return [];
        }
        try {
            const models = getAvailableModels(providerId);
            return Array.isArray(models) ? models : [];
        } catch (e) {
            console.error("Could not read the model catalog:", e);
            return [];
        }
    };

    // Pick the model to send. A model left behind by a different provider —
    // like gpt-4o still sitting there after switching to Google — must not be
    // sent, or the provider 404s on a model it has never heard of.
    const resolveModel = (providerId, requestedModel) => {
        const config = PROVIDERS[providerId];
        const model = (requestedModel || "").trim();

        if (!model) {
            return config.defaultModel;
        }

        const catalog = availableModels(providerId);
        if (catalog.length > 0) {
            return catalog.indexOf(model) !== -1 ? model : config.defaultModel;
        }

        // No catalog: fall back to the naming conventions we know. Providers
        // with no recognisable prefix keep whatever the user typed.
        if (config.modelPrefixes.length === 0) {
            return model;
        }
        const belongsToProvider = config.modelPrefixes.some((prefix) => model.toLowerCase().indexOf(prefix) === 0);
        return belongsToProvider ? model : config.defaultModel;
    };

    // The full system prompt: the user's instructions, plus how long the answer
    // should be.
    const buildSystemPrompt = (basePrompt, responseLength, lengthHint) => {
        const parts = [basePrompt];
        parts.push(RESPONSE_LENGTHS[responseLength] || RESPONSE_LENGTHS.standard);
        if (lengthHint) {
            parts.push(lengthHint);
        }
        return parts.join(" ");
    };

    // Helper function to build request for different providers
    const buildRequest = (provider, model, systemPrompt, userPrompt, temperature) => {
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

            // No max_tokens: newer models reject it in favour of
            // max_completion_tokens, and length is handled in the prompt.
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
                temperature
            };
        } else if (providerId === "anthropic") {
            // Anthropic format
            headers = {
                "Content-Type": "application/json",
                "x-api-key": "{{API_KEY}}",
                "anthropic-version": "2023-06-01"
            };

            // max_tokens is required by this API — set it high enough to be a
            // safety valve rather than the thing that ends the answer.
            body = {
                model,
                max_tokens: ANTHROPIC_MAX_TOKENS,
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
            // Google AI format. The key travels in a header, not the query
            // string: Antinote only substitutes {{API_KEY}} into headers and
            // the body, so a key in the URL would be sent as the literal
            // placeholder.
            url = `${config.endpoint}${model}:generateContent`;
            headers = {
                "Content-Type": "application/json",
                "x-goog-api-key": "{{API_KEY}}"
            };

            // Gemma models on this API reject systemInstruction, so their
            // instructions ride along with the prompt instead.
            const supportsSystemInstruction = model.toLowerCase().indexOf("gemini") === 0;

            body = {
                contents: [
                    {
                        parts: [
                            {
                                text: supportsSystemInstruction ? userPrompt : `${systemPrompt}\n\n${userPrompt}`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature
                }
            };

            if (supportsSystemInstruction) {
                body.systemInstruction = {
                    parts: [
                        {
                            text: systemPrompt
                        }
                    ]
                };
            }
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
                    return (responseData.choices[0].message?.content || "").trim() || null;
                }
            } else if (providerId === "anthropic") {
                if (responseData.content?.length > 0) {
                    return responseData.content
                        .filter((block) => block.type === "text")
                        .map((block) => block.text)
                        .join("")
                        .trim() || null;
                }
            } else if (providerId === "google") {
                if (responseData.candidates?.length > 0) {
                    const candidate = responseData.candidates[0];
                    if (candidate.content?.parts?.length > 0) {
                        return candidate.content.parts
                            .map((part) => part.text || "")
                            .join("")
                            .trim() || null;
                    }
                }
            }
            return null;
        } catch (e) {
            console.error("Error parsing response:", e);
            return null;
        }
    };

    // A 200 with nothing usable in it. Say why, in words that point at a fix.
    const describeEmptyResponse = (providerId, responseData) => {
        const providerName = PROVIDERS[providerId].name;
        const blockReason = responseData?.promptFeedback?.blockReason;
        if (blockReason) {
            return `${providerName} blocked this request (${blockReason}).`;
        }

        const finishReason = responseData?.candidates?.[0]?.finishReason
            || responseData?.choices?.[0]?.finish_reason;

        if (finishReason === "MAX_TOKENS" || finishReason === "length") {
            return `${providerName} ran out of room before it wrote an answer. Reasoning models spend that budget thinking — try a shorter note or a non-reasoning model.`;
        }
        if (finishReason === "SAFETY" || finishReason === "content_filter") {
            return `${providerName} stopped this response on its safety filter.`;
        }
        if (finishReason === "RECITATION") {
            return `${providerName} stopped this response because it matched training data.`;
        }

        return `Could not read the response from ${providerName}. Response: ${JSON.stringify(responseData)}`;
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
    //     - maxTokens: Rough length hint in tokens (0 = use the length preference)
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

            if (!PROVIDERS[provider]) {
                return new ReturnObject({status: "error", message: `Invalid provider configuration: ${provider}`});
            }

            const model = resolveModel(provider, options.model || getExtensionPreference(extensionName, "model"));
            const basePrompt = options.systemPrompt || getExtensionPreference(extensionName, "systemPrompt") || "You are a helpful assistant integrated into a plaintext scratch notes app. Be concise and direct.";
            const responseLength = getExtensionPreference(extensionName, "responseLength") || "standard";
            const temperature = options.temperature !== undefined ? options.temperature : 0.7;

            if (temperature < 0 || temperature > 2) {
                return new ReturnObject({status: "error", message: "temperature must be between 0.0 and 2.0."});
            }

            // An explicit token count is a length hint for the prompt, not a cap
            // on the response — a cap cuts the answer off mid-sentence.
            let lengthHint = "";
            const requestedTokens = parseInt(options.maxTokens, 10);
            if (!isNaN(requestedTokens) && requestedTokens > 0) {
                lengthHint = `Keep your answer to roughly ${Math.round(requestedTokens * 0.75)} words.`;
            }

            const systemPrompt = buildSystemPrompt(basePrompt, responseLength, lengthHint);

            console.log("AI Provider Service - Calling with provider:", provider);
            console.log("AI Provider Service - Using model:", model);

            // Build request for the selected provider
            const request = buildRequest(provider, model, systemPrompt, prompt, temperature);

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

            // Read the body before the status: providers explain their failures
            // in it, and that explanation beats "HTTP 400" every time.
            let responseData = null;
            try {
                responseData = JSON.parse(result.data);
            } catch (e) {
                responseData = null;
            }

            const apiError = responseData?.error;
            if (apiError) {
                let errorMessage = apiError.message || apiError;
                if (typeof errorMessage === "object") {
                    errorMessage = JSON.stringify(errorMessage);
                }
                return new ReturnObject({status: "error", message: `API error: ${errorMessage}`});
            }

            if (!result.success) {
                return new ReturnObject({status: "error", message: `API call failed: ${result.error || "Unknown error"}`});
            }

            if (!responseData) {
                return new ReturnObject({status: "error", message: `Could not read the response from ${PROVIDERS[provider].name}.`});
            }

            // Extract response text based on provider
            const responseText = parseResponse(provider, responseData);

            if (!responseText) {
                return new ReturnObject({status: "error", message: describeEmptyResponse(provider, responseData)});
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
