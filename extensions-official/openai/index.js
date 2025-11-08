// OpenAI Extension
// This demonstrates how to use the callAPI bridge to make API calls
//
// Setup Instructions:
// 1. Go to Preferences > API Keys
// 2. Add a new API key with:
//    - Name: "OpenAI"
//    - Keychain Key: "apikey_openai"
//    - API Key Value: Your OpenAI API key (starts with sk-...)
// 3. Copy this file to ~/Library/Application Support/Antinote/Extensions/
// 4. Restart Antinote
//
// Usage:
// Type: gpt(What is the capital of France?)
// Then press Enter

(function () {
    // 1. Name your extension (use local scope to avoid conflicts)
    var extensionName = "openai";

    // 2. Create the extension root with endpoints and required API keys
    var extensionRoot = new Extension(
        extensionName,
        "1.0.0",
        ["https://api.openai.com/v1/chat/completions"],  // Endpoints this extension calls
        ["apikey_openai"],  // API key IDs required for this extension
        "anthropics",  // Author (GitHub username)
        "AI",  // Category
        "none"  // Data scope: "none", "line", or "full" - only sends current line for privacy
    );

    // 2a. Register extension preferences
    var modelPref = new Preference(
        "model",
        "OpenAI Model",
        "selectOne",
        "gpt-4o",
        ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
        "Select which OpenAI model to use for completions"
    );
    extensionRoot.register_preference(modelPref);

    var systemPromptPref = new Preference(
        "systemPrompt",
        "System Prompt",
        "string",
        "You are a helpful assistant integrated into a plaintext scratch notes app. Be concise and direct.",
        null,
        "Customize the system prompt sent to OpenAI"
    );
    extensionRoot.register_preference(systemPromptPref);

    // 3. Create a command for your extension
    var gpt = new Command(
        "gpt",  // Command name (what the user types)

        // 4. Create the parameters for the command
        [
            new Parameter("string", "prompt", "The prompt to send to GPT", "Hello, how are you?"),
            new Parameter("int", "max_tokens", "Maximum tokens in the response", 150),
            new Parameter("float", "temperature", "Randomness of the response (0.0-2.0)", 0.7)
        ],

        "insert",  // Action: "insert", "replaceLine", "replaceAll", or "openURL"
        "Ask GPT a question using OpenAI's API",  // Description

        // Examples of how to use the command
        [
            new TutorialCommand("gpt(What is the capital of France?)", "Ask GPT a simple question"),
            new TutorialCommand("gpt(Explain quantum computing in simple terms, 300)", "Get a longer explanation"),
            new TutorialCommand("gpt(Write a haiku about coding, 100, 1.2)", "More creative response")
        ],
        extensionRoot
    );

    // 5. Write your function
    gpt.execute = function (payload) {
        try {
            // This will automatically replace empty parameters with the default values and parse them based on the parameter type
            var [prompt, max_tokens, temperature] = this.getParsedParams(payload);

            // Error handling
            if (!prompt || prompt.trim() === "") {
                return new ReturnObject("error", "Please provide a prompt.");
            }

            if (max_tokens < 1 || max_tokens > 4000) {
                return new ReturnObject("error", "max_tokens must be between 1 and 4000.");
            }

            if (temperature < 0 || temperature > 2) {
                return new ReturnObject("error", "temperature must be between 0.0 and 2.0.");
            }

            // Get preferences from ExtensionsPreferences
            var model = getExtensionPreference(extensionName, "model") || "gpt-4o";
            var systemPrompt = getExtensionPreference(extensionName, "systemPrompt") || "You are a helpful assistant integrated into a plaintext scratch notes app. Be concise and direct.";

            console.log("Calling OpenAI with model:", model); // Console logs will appear in Terminal if you launch Antinote from the command line
            console.log("Calling OpenAI with prompt:", prompt);

            // Prepare the API request
            var url = "https://api.openai.com/v1/chat/completions";
            var method = "POST";

            // Headers ({{API_KEY}} will be replaced by the actual key from keychain)
            var headers = JSON.stringify({
                "Content-Type": "application/json",
                "Authorization": "Bearer {{API_KEY}}"
            });

            // Request body - using the model preference
            var body = JSON.stringify({
                "model": model,
                "messages": [
                    {
                        "role": "system",
                        "content": systemPrompt
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": max_tokens,
                "temperature": temperature
            });

            // Call the API using the Swift bridge
            // Parameters: apiKeyName, url, method, headers, body
            // Note: Extension identity is automatically determined by the system for security
            var result = callAPI(
                "apikey_openai",     // The keychain key for the API key
                url,
                method,
                headers,
                body
            );

            console.log("API call result:", JSON.stringify(result));

            // Check if the API call was successful
            if (!result.success) {
                return new ReturnObject(
                    "error",
                    "API call failed: " + (result.error || "Unknown error")
                );
            }

            // Parse the OpenAI response
            var responseData = JSON.parse(result.data);

            if (responseData.error) {
                return new ReturnObject(
                    "error",
                    "OpenAI API error: " + responseData.error.message
                );
            }

            // Extract the response text
            var responseText = responseData.choices[0].message.content.trim();

            var success = new ReturnObject("success", "GPT responded successfully", responseText);
            return success;

        } catch (error) {
            console.error("Extension error:", error);
            return new ReturnObject(
                "error",
                "Extension error: " + error.toString()
            );
        }
    };
})();
