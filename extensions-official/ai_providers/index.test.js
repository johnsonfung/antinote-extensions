// Test file for AI Providers extension
// This extension is a service with no commands, so tests focus on metadata

var fs = require('fs');
var path = require('path');

// Mock test framework functions
function describe(name, fn) {
  console.log("\n" + name);
  fn();
}

function it(name, fn) {
  try {
    fn();
    console.log("  ✓ " + name);
  } catch (e) {
    console.log("  ✗ " + name);
    console.log("    Error: " + e.message);
  }
}

function expect(actual) {
  return {
    toBe: function(expected) {
      if (actual !== expected) {
        throw new Error("Expected " + expected + " but got " + actual);
      }
    },
    toContain: function(expected) {
      if (actual.indexOf(expected) === -1) {
        throw new Error("Expected " + actual + " to contain " + expected);
      }
    },
    toBeDefined: function() {
      if (actual === undefined || actual === null) {
        throw new Error("Expected value to be defined");
      }
    },
    toBeArray: function() {
      if (!Array.isArray(actual)) {
        throw new Error("Expected " + actual + " to be an array");
      }
    },
    toBeGreaterThanOrEqual: function(expected) {
      if (actual < expected) {
        throw new Error("Expected " + actual + " to be >= " + expected);
      }
    }
  };
}

// Load and parse extension.json
var metadataPath = path.join(__dirname, 'extension.json');
var metadataContent = fs.readFileSync(metadataPath, 'utf8');
var metadata = JSON.parse(metadataContent);

// Tests for extension metadata
describe("AI Providers Extension - Metadata Validation", function() {

  it("should have required name field", function() {
    expect(metadata.name).toBeDefined();
    expect(metadata.name).toBe("ai_providers");
  });

  it("should have required version field", function() {
    expect(metadata.version).toBeDefined();
    expect(metadata.version).toBeDefined();
  });

  it("should have required author field", function() {
    expect(metadata.author).toBeDefined();
  });

  it("should have required category field", function() {
    expect(metadata.category).toBeDefined();
    expect(metadata.category).toBe("AI & ML");
  });

  it("should have required dataScope field", function() {
    expect(metadata.dataScope).toBeDefined();
    expect(metadata.dataScope).toBe("none");
  });

  it("should have endpoints array with all provider APIs", function() {
    expect(metadata.endpoints).toBeDefined();
    expect(metadata.endpoints).toBeArray();
    expect(metadata.endpoints.length).toBeGreaterThanOrEqual(5);
    expect(metadata.endpoints[0]).toContain("api.openai.com");
    expect(metadata.endpoints[1]).toContain("api.anthropic.com");
    expect(metadata.endpoints[2]).toContain("generativelanguage.googleapis.com");
    expect(metadata.endpoints[3]).toContain("openrouter.ai");
    expect(metadata.endpoints[4]).toContain("localhost:11434");
  });

  it("should require API keys for cloud providers", function() {
    expect(metadata.requiredAPIKeys).toBeDefined();
    expect(metadata.requiredAPIKeys).toBeArray();
    expect(metadata.requiredAPIKeys.length).toBeGreaterThanOrEqual(4);
    expect(metadata.requiredAPIKeys[0]).toBe("apikey_openai");
    expect(metadata.requiredAPIKeys[1]).toBe("apikey_anthropic");
    expect(metadata.requiredAPIKeys[2]).toBe("apikey_google");
    expect(metadata.requiredAPIKeys[3]).toBe("apikey_openrouter");
  });

  it("should have no commands (service only)", function() {
    expect(metadata.commands).toBeDefined();
    expect(metadata.commands).toBeArray();
    expect(metadata.commands.length).toBe(0);
  });

  it("should be marked as a service", function() {
    expect(metadata.isService).toBeDefined();
    expect(metadata.isService).toBe(true);
  });

  it("should be official", function() {
    expect(metadata.official).toBeDefined();
    expect(metadata.official).toBe(true);
  });

  it("should be included by default", function() {
    expect(metadata.includedByDefault).toBeDefined();
    expect(metadata.includedByDefault).toBe(true);
  });
});

describe("AI Providers Extension - Service API Tests", function() {

  it("should export callAIProvider function globally", function() {
    // This test would verify the function is available
    // In actual runtime, the function would be on window or global
    // For now, just document the expected behavior
  });

  it("should export AI_PROVIDERS constant globally", function() {
    // This test would verify the PROVIDERS object is available
    // In actual runtime, it would be on window or global
  });
});

describe("AI Providers Extension - Request Building", function() {

  // The harness declares callAPI/getExtensionPreference as top-level
  // functions; reassigning them here lets each test drive the service.
  var lastCall = null;
  var mockPrefs = {};

  // Shaped for every provider at once, so a test only overrides it when the
  // shape of the response is what is under test.
  var okResponse = {
    choices: [{ message: { content: "ok" } }],
    content: [{ type: "text", text: "ok" }],
    candidates: [{ content: { parts: [{ text: "ok" }] } }]
  };
  var mockResponse = okResponse;

  callAPI = function(apiKeyId, url, method, headers, body) {
    lastCall = {
      apiKeyId: apiKeyId,
      url: url,
      method: method,
      headers: JSON.parse(headers),
      body: JSON.parse(body)
    };
    return { success: true, statusCode: 200, data: JSON.stringify(mockResponse) };
  };

  getExtensionPreference = function(extensionName, key) {
    return Object.prototype.hasOwnProperty.call(mockPrefs, key) ? mockPrefs[key] : null;
  };

  function run(prefs, options) {
    mockPrefs = prefs || {};
    lastCall = null;
    return global.callAIProvider("Say hi", options || {});
  }

  it("sends the Google key as a header, never in the URL", function() {
    var result = run({ provider: "google", model: "gemini-2.5-flash" });
    expect(result.status).toBe("success");
    expect(lastCall.url).toBe("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent");
    expect(lastCall.headers["x-goog-api-key"]).toBe("{{API_KEY}}");
    expect(lastCall.apiKeyId).toBe("apikey_google");
  });

  it("puts Gemma instructions in the prompt, since that API has no systemInstruction", function() {
    getAvailableModels = function() { return ["gemma-3-27b-it"]; };
    run({ provider: "google", model: "gemma-3-27b-it" });
    expect(lastCall.body.systemInstruction).toBe(undefined);
    expect(lastCall.body.contents[0].parts[0].text).toContain("Say hi");
    expect(lastCall.body.contents[0].parts[0].text).toContain("plaintext scratch notes app");
    getAvailableModels = undefined;
  });

  it("sends a system instruction for Gemini models", function() {
    run({ provider: "google", model: "gemini-2.5-flash" });
    expect(lastCall.body.systemInstruction.parts[0].text).toContain("plaintext scratch notes app");
    expect(lastCall.body.contents[0].parts[0].text).toBe("Say hi");
  });

  it("falls back to the provider default when the model belongs to another provider", function() {
    // Switching to Google used to leave "gpt-4o" in the shared model setting
    run({ provider: "google", model: "gpt-4o" });
    expect(lastCall.url).toContain("gemini-2.5-flash:generateContent");
  });

  it("uses the provider default when no model is configured", function() {
    run({ provider: "google" });
    expect(lastCall.url).toContain("gemini-2.5-flash:generateContent");
  });

  it("keeps a model the live catalog knows about", function() {
    getAvailableModels = function() { return ["gemini-3-pro", "gemini-2.5-flash"]; };
    run({ provider: "google", model: "gemini-3-pro" });
    expect(lastCall.url).toContain("gemini-3-pro:generateContent");
    getAvailableModels = undefined;
  });

  it("rejects a model the live catalog does not list", function() {
    getAvailableModels = function() { return ["gemini-2.5-flash"]; };
    run({ provider: "google", model: "gemini-1.5-pro" });
    expect(lastCall.url).toContain("gemini-2.5-flash:generateContent");
    getAvailableModels = undefined;
  });

  it("does not cap output tokens on OpenAI-compatible providers", function() {
    run({ provider: "openai" });
    expect(lastCall.body.max_tokens).toBe(undefined);
    expect(lastCall.body.max_completion_tokens).toBe(undefined);
  });

  it("does not cap output tokens on Google", function() {
    run({ provider: "google" });
    expect(lastCall.body.generationConfig.maxOutputTokens).toBe(undefined);
  });

  it("still sends the max_tokens Anthropic requires", function() {
    run({ provider: "anthropic" });
    expect(lastCall.body.max_tokens).toBe(8192);
  });

  it("asks for the response length in the system prompt", function() {
    run({ provider: "openai", responseLength: "brief" });
    expect(lastCall.body.messages[0].content).toContain("couple of sentences");
  });

  it("turns an explicit token count into a word count in the prompt", function() {
    run({ provider: "openai" }, { maxTokens: 400 });
    expect(lastCall.body.messages[0].content).toContain("300 words");
    expect(lastCall.body.max_tokens).toBe(undefined);
  });

  it("explains a 200 that came back with no answer", function() {
    mockResponse = { candidates: [{ finishReason: "MAX_TOKENS", content: {} }] };
    var result = run({ provider: "google" });
    expect(result.status).toBe("error");
    expect(result.message).toContain("ran out of room");
    mockResponse = okResponse;
  });

  it("surfaces the provider's own error text on a failed call", function() {
    callAPI = function() {
      return {
        success: false,
        statusCode: 400,
        data: JSON.stringify({ error: { message: "API key not valid" } }),
        error: "HTTP 400"
      };
    };
    var result = run({ provider: "google" });
    expect(result.status).toBe("error");
    expect(result.message).toContain("API key not valid");
  });
});

// Run the tests
console.log("Running AI Providers Extension Tests...");
console.log("==========================================");
console.log("Note: This is a service extension with no user-facing commands");
