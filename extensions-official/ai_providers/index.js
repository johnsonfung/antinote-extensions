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
// - Custom (any OpenAI- or Anthropic-compatible endpoint: Azure OpenAI,
//   LiteLLM, vLLM, a Bedrock gateway, ...)
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

    // Preferences read through the app bridge, guarded so this file also loads
    // where the bridge isn't installed yet (the Node test harness).
    const readPreference = (key) => {
        if (typeof getExtensionPreference !== "function") {
            return null;
        }
        try {
            return getExtensionPreference(extensionName, key);
        } catch (e) {
            return null;
        }
    };

    const customEndpointNow = () => (readPreference("customEndpoint") || "").trim();

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
        },
        "custom": {
            name: "Custom Endpoint",
            // The real URL lives in the customEndpoint preference: read at call
            // time for requests, declared to the app at load time (below).
            endpoint: "",
            apiKeyId: "apikey_custom",
            models: [],
            // No default: only the user knows what their endpoint serves.
            defaultModel: "",
            modelPrefixes: [],
            requiresApiKey: true
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
        // Never declare an empty endpoint: the app's allow-list does prefix
        // matching, and "" would authorize every URL.
        if (provider.endpoint) {
            allEndpoints.push(provider.endpoint);
        }
        if (provider.requiresApiKey && provider.apiKeyId) {
            allApiKeys.push(provider.apiKeyId);
        }
    }

    // Declaring the saved custom URL here is what authorizes it with the app's
    // endpoint allow-list — so a URL saved after load only takes effect once
    // extensions reload. callAIProvider explains that when it happens.
    const customEndpointAtLoad = customEndpointNow();
    if (customEndpointAtLoad) {
        allEndpoints.push(customEndpointAtLoad);
    }

    const extensionRoot = new Extension({
        name: extensionName,
        version: "1.2.0",
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
    options: ["openai", "anthropic", "google", "openrouter", "ollama", "custom"],
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

    const customEndpointPref = new Preference({
    key: "customEndpoint",
    label: "Custom Endpoint URL",
    type: "string",
    defaultValue: "",
    options: null,
    helpText: "Used when the provider is 'custom': the full chat URL of any OpenAI- or Anthropic-compatible endpoint (Azure OpenAI, LiteLLM, a Bedrock gateway, self-hosted vLLM...). After changing it, reload extensions so Antinote authorizes the new URL."
  });
    extensionRoot.register_preference(customEndpointPref);

    const customFormatPref = new Preference({
    key: "customFormat",
    label: "Custom Endpoint Format",
    type: "selectOne",
    defaultValue: "openai",
    options: ["openai", "anthropic"],
    helpText: "Which API the custom endpoint speaks: 'openai' for chat-completions shapes, 'anthropic' for messages shapes."
  });
    extensionRoot.register_preference(customFormatPref);

    const customAuthPref = new Preference({
    key: "customAuth",
    label: "Custom Endpoint Auth",
    type: "selectOne",
    defaultValue: "bearer",
    options: ["bearer", "x-api-key", "none"],
    helpText: "How the custom endpoint wants its API key: an 'Authorization: Bearer' header, an 'x-api-key' header, or no key at all (local or proxied setups)."
  });
    extensionRoot.register_preference(customAuthPref);

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

    // Which wire protocol a provider speaks. The custom endpoint borrows one
    // of the shapes we already build rather than inventing a third.
    const wireFormat = (providerId) => {
        if (providerId === "custom") {
            return readPreference("customFormat") === "anthropic" ? "anthropic" : "openai";
        }
        if (providerId === "openai" || providerId === "openrouter" || providerId === "ollama") {
            return "openai";
        }
        return providerId; // "anthropic" or "google"
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

    // Helper function to build request for different providers.
    // `temperature` may be undefined and is only sent when it isn't: reasoning
    // models (gpt-5, o-series) reject values other than their default, and no
    // provider requires one — Anthropic included.
    const buildRequest = (provider, model, systemPrompt, userPrompt, temperature) => {
        const providerId = provider.toLowerCase();
        const config = PROVIDERS[providerId];

        if (!config) {
            return null;
        }

        const format = wireFormat(providerId);
        let url = config.endpoint;
        let headers = {};
        let body = {};
        let apiKeyId = config.apiKeyId;

        // How the key travels: Anthropic's own API wants x-api-key, Google its
        // own header, the custom endpoint follows its auth preference, and
        // everyone else uses a Bearer token. Ollama sends nothing.
        let authStyle = "bearer";
        if (providerId === "anthropic") {
            authStyle = "x-api-key";
        } else if (providerId === "google") {
            authStyle = "x-goog-api-key";
        } else if (providerId === "ollama") {
            authStyle = "none";
        } else if (providerId === "custom") {
            const authPref = readPreference("customAuth");
            authStyle = (authPref === "x-api-key" || authPref === "none") ? authPref : "bearer";
            url = customEndpointNow();
        }
        if (authStyle === "none") {
            apiKeyId = null;
        }

        if (format === "openai") {
            // OpenAI-compatible format (OpenAI, OpenRouter, Ollama, custom)
            headers = {
                "Content-Type": "application/json"
            };

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
                ]
            };
        } else if (format === "anthropic") {
            // Anthropic format (Anthropic, custom)
            headers = {
                "Content-Type": "application/json",
                "anthropic-version": "2023-06-01"
            };

            // max_tokens is required by this API — set it high enough to be a
            // safety valve rather than the thing that ends the answer.
            body = {
                model,
                max_tokens: ANTHROPIC_MAX_TOKENS,
                system: systemPrompt,
                messages: [
                    {
                        role: "user",
                        content: userPrompt
                    }
                ]
            };
        } else if (format === "google") {
            // Google AI format. The key travels in a header, not the query
            // string: Antinote only substitutes {{API_KEY}} into headers and
            // the body, so a key in the URL would be sent as the literal
            // placeholder.
            url = `${config.endpoint}${model}:generateContent`;
            headers = {
                "Content-Type": "application/json"
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
                generationConfig: {}
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

        if (authStyle === "bearer") {
            headers["Authorization"] = "Bearer {{API_KEY}}";
        } else if (authStyle === "x-api-key") {
            headers["x-api-key"] = "{{API_KEY}}";
        } else if (authStyle === "x-goog-api-key") {
            headers["x-goog-api-key"] = "{{API_KEY}}";
        }

        // Only send a temperature the caller actually asked for (see above).
        if (temperature !== undefined) {
            if (format === "google") {
                body.generationConfig.temperature = temperature;
            } else {
                body.temperature = temperature;
            }
        }

        return {
            url,
            headers: JSON.stringify(headers),
            body: JSON.stringify(body),
            apiKeyId,
            provider: config
        };
    };

    // Helper function to parse response from different providers
    const parseResponse = (providerId, responseData) => {
        try {
            const format = wireFormat(providerId);
            if (format === "openai") {
                if (responseData.choices?.length > 0) {
                    return (responseData.choices[0].message?.content || "").trim() || null;
                }
            } else if (format === "anthropic") {
                if (responseData.content?.length > 0) {
                    return responseData.content
                        .filter((block) => block.type === "text")
                        .map((block) => block.text)
                        .join("")
                        .trim() || null;
                }
            } else if (format === "google") {
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
    //     - provider: Provider ID ("openai", "anthropic", "google", "openrouter", "ollama", "custom")
    //     - model: Model name
    //     - systemPrompt: System prompt
    //     - maxTokens: Rough length hint in tokens (0 = use the length preference)
    //     - temperature: Temperature 0.0-2.0 (optional — only sent when set,
    //       since reasoning models reject anything but their default)
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
            const provider = options.provider || readPreference("provider") || "openai";

            if (!PROVIDERS[provider]) {
                return new ReturnObject({status: "error", message: `Invalid provider configuration: ${provider}`});
            }

            const model = resolveModel(provider, options.model || readPreference("model"));

            if (provider === "custom") {
                if (!customEndpointNow()) {
                    return new ReturnObject({status: "error", message: "Set the Custom Endpoint URL in the ai_providers extension settings first."});
                }
                if (!model) {
                    return new ReturnObject({status: "error", message: "Custom endpoints have no default model — set one in the ai_providers extension settings."});
                }
            }

            const basePrompt = options.systemPrompt || readPreference("systemPrompt") || "You are a helpful assistant integrated into a plaintext scratch notes app. Be concise and direct.";
            const responseLength = readPreference("responseLength") || "standard";

            // Temperature is only forwarded when a caller explicitly set one:
            // Anthropic never required it, and reasoning models (gpt-5,
            // o-series) reject anything but their default — the old
            // always-send-0.7 behaviour broke both.
            let temperature = options.temperature;
            if (typeof temperature !== "number" || isNaN(temperature)) {
                temperature = undefined;
            }
            if (temperature !== undefined && (temperature < 0 || temperature > 2)) {
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

            // Call the API. An empty key id means no key is needed (Ollama,
            // keyless custom endpoints).
            const result = callAPI(
                request.apiKeyId || "",
                request.url,
                "POST",
                request.headers,
                request.body
            );

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

            // A custom URL saved after extensions loaded isn't on the app's
            // allow-list yet — the app blocks it, and the fix is a reload, not
            // a scary security message.
            if (!result.success && provider === "custom" && (result.error || "").indexOf("not authorized") !== -1) {
                return new ReturnObject({status: "error", message: `Antinote hasn't authorized ${request.url} yet — custom endpoint URLs are registered when extensions load. Reload extensions (Settings → Extensions) or restart Antinote, then try again.`});
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
