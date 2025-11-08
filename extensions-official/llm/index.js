// LLM Extension
// General-purpose AI command that uses the ai_providers service
//
// This extension depends on ai_providers for all AI functionality.
// Configure your AI provider in: Preferences > Extensions > AI Providers
//
// Usage:
// Type: ai(What is the capital of France?)
// Then press Enter

(function () {
    var extensionName = "llm";

    // This extension depends on ai_providers service
    // No endpoints or API keys needed - all handled by ai_providers
    var extensionRoot = new Extension(
        extensionName,
        "3.0.0",
        [],  // No endpoints - uses ai_providers
        [],  // No API keys - uses ai_providers
        "johnsonfung",
        "AI & ML",
        "none"
    );

    // Create the ai command
    var ai = new Command(
        "ai",
        [
            new Parameter("string", "prompt", "The prompt to send to the AI", "Hello, how are you?"),
            new Parameter("int", "max_tokens", "Maximum tokens in the response (0 = use default)", 0),
            new Parameter("float", "temperature", "Randomness of the response (0.0-2.0)", 0.7)
        ],
        "insert",
        "Insert an AI-generated response to your prompt",
        [
            new TutorialCommand("ai(What is the capital of France?)", "Get an AI response to a simple question"),
            new TutorialCommand("ai(Explain quantum computing in simple terms, 300)", "Get a longer explanation with 300 tokens"),
            new TutorialCommand("ai(Write a haiku about coding, 100, 1.2)", "More creative response with higher temperature")
        ],
        extensionRoot
    );

    ai.execute = function (payload) {
        try {
            var [prompt, max_tokens, temperature] = this.getParsedParams(payload);

            // Validation
            if (!prompt || prompt.trim() === "") {
                return new ReturnObject("error", "Please provide a prompt.");
            }

            // Check if ai_providers service is available
            if (typeof callAIProvider === 'undefined') {
                return new ReturnObject(
                    "error",
                    "AI Providers service not available. Please ensure the ai_providers extension is installed and enabled."
                );
            }

            // Call the AI Providers service
            var result = callAIProvider(prompt, {
                maxTokens: max_tokens,
                temperature: temperature
            });

            return result;

        } catch (error) {
            console.error("LLM Extension error:", error);
            return new ReturnObject(
                "error",
                "Extension error: " + error.toString()
            );
        }
    };
})();
