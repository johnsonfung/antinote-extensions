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
    const extensionName = "llm";

    // This extension depends on ai_providers service
    // No endpoints or API keys needed - all handled by ai_providers
    const extensionRoot = new Extension({
        name: extensionName,
        version: "3.0.1",
        endpoints: [],  // No endpoints - uses ai_providers
        requiredAPIKeys: [],  // No API keys - uses ai_providers
        author: "johnsonfung",
        category: "AI & ML",
        dataScope: "none",
        dependencies: ["ai_providers"],  // dependencies
        isService: false  // isService
    });

    // Create the ai command
    const ai = new Command({
        name: "ai",
        parameters: [
            new Parameter({ type: "string", name: "prompt", helpText: "The prompt to send to the AI", required: true }),
            new Parameter({ type: "int", name: "max_tokens", helpText: "Maximum tokens in the response (0 = use default from ai_providers)", default: 0, required: false }),
            new Parameter({ type: "float", name: "temperature", helpText: "Randomness of the response (0.0-2.0)", default: 0.7, required: false })
        ],
        type: "insert",
        helpText: "Insert an AI-generated response to your prompt",
        tutorials: [
            new TutorialCommand({ command: "ai(What is the capital of France?)", description: "Get an AI response to a simple question" }),
            new TutorialCommand({ command: "ai(Explain quantum computing in simple terms, 300)", description: "Get a longer explanation with 300 tokens" }),
            new TutorialCommand({ command: "ai(Write a haiku about coding, 100, 1.2)", description: "More creative response with higher temperature" })
        ],
        extension: extensionRoot
    });

    ai.execute = function (payload) {
        try {
            const [prompt, max_tokens, temperature] = this.getParsedParams(payload);

            // Validation
            if (!prompt || prompt.trim() === "") {
                return new ReturnObject({ status: "error", message: "Please provide a prompt." });
            }

            // Check if ai_providers service is available
            if (typeof callAIProvider === 'undefined') {
                return new ReturnObject({ status: "error", message: "AI Providers service not available. Please ensure the ai_providers extension is installed and enabled." });
            }

            // Call the AI Providers service
            const result = callAIProvider(prompt, {
                maxTokens: max_tokens,
                temperature
            });

            return result;

        } catch (error) {
            console.error("LLM Extension error:", error);
            return new ReturnObject({
                status: "error",
                message: `Extension error: ${error.toString()}`
            });
        }
    };
})();
