# 🌐 Building Network Extensions

Learn how to build extensions that call external APIs safely and securely.

---

## Overview

Network extensions make HTTP requests to external APIs using Antinote's **Swift bridge security layer**. This architecture ensures API keys are never exposed to JavaScript code.

**Security Model:**
```
Extension (JS) → callAPI() → Swift Bridge → Validates → HTTP Request → External API
                                ↓
                         Checks endpoint
                         Retrieves API key
                         Replaces {{API_KEY}}
```

---

## Quick Start

### 1. Declare Endpoints and API Keys

```js
const extensionRoot = new Extension({
  name: "weather",
  version: "1.0.0",
  // Declare ALL endpoints you'll call
  endpoints: ["https://api.weatherapi.com/v1"],
  // Declare required API key IDs
  requiredAPIKeys: ["apikey_weather"],
  author: "your_github",
  category: "Utilities",
  dataScope: "none"  // Weather doesn't need note content
});
```

### 2. Make API Call

```js
my_command.execute = function(payload) {
  const [city] = this.getParsedParams(payload);

  // Prepare request
  const url = `https://api.weatherapi.com/v1/current.json?key={{API_KEY}}&q=${encodeURIComponent(city)}`;
  const headers = JSON.stringify({
    "Content-Type": "application/json"
  });

  // Call API through Swift bridge
  const result = callAPI(
    "apikey_weather",  // API key ID
    url,
    "GET",
    headers,
    ""  // Empty body for GET
  );

  // Handle response
  if (!result.success) {
    return new ReturnObject({status: "error", message: `API failed: ${result.error}`});
  }

  const data = JSON.parse(result.data);
  return new ReturnObject({status: "success", message: "Weather retrieved", payload: data.current.temp_f + "°F"});
};
```

### 3. User Configures API Key

Users add the API key in **Preferences > Extensions > API Keys**:
- **Name**: Weather API (friendly display name)
- **Keychain Key**: `apikey_weather` (exact ID from your code)
- **API Key Value**: Their actual API key

---

## API Reference

### `callAPI(apiKeyId, url, method, headers, body)`

Makes an authenticated HTTP request through the Swift bridge.

**Parameters:**
- **`apiKeyId`** (string): API key ID to use (e.g., `"apikey_weather"`)
  - Use `""` for APIs that don't need a key
  - Must be declared in extension's `requiredAPIKeys` array
- **`url`** (string): Full URL to call
  - Must match a declared endpoint (prefix matching)
  - Use `{{API_KEY}}` placeholder if key goes in URL
- **`method`** (string): HTTP method (`"GET"`, `"POST"`, `"PUT"`, `"DELETE"`, etc.)
- **`headers`** (string): JSON string of headers
  - Use `{{API_KEY}}` placeholder for auth headers
- **`body`** (string): Request body (empty string for GET)
  - JSON should be stringified

**Returns:**
```js
{
  success: true/false,
  data: "response body",     // On success
  error: "error message"     // On failure
}
```

**Security Notes:**
- Extension identity is **automatically determined** by Swift
- Extensions **cannot spoof** other extensions
- `{{API_KEY}}` placeholders are **replaced by Swift**
- JavaScript code **never sees** actual API key values

---

## Endpoint Declaration

### Basic Declaration

Declare all endpoints your extension will call:

```js
new Extension({
  name: "my_extension",
  version: "1.0.0",
  endpoints: [
    "https://api.service.com/v1/endpoint1",
    "https://api.service.com/v1/endpoint2"
  ],
  requiredAPIKeys: ["apikey_service"],
  // ... other properties
})
```

### Prefix Matching

Declaring an endpoint allows that URL and all subpaths:

```js
// Declaring this:
["https://api.example.com/v1"]

// Allows these:
✅ https://api.example.com/v1/users
✅ https://api.example.com/v1/data/fetch
✅ https://api.example.com/v1/anything/here

// Blocks these:
❌ https://api.example.com/v2/users (different prefix)
❌ https://evil.com (completely different domain)
❌ https://api.example.com (too short - need full prefix)
```

### Multiple Domains

If your extension calls multiple services:

```js
["https://api.service1.com", "https://api.service2.com"]
```

### Query Parameters

Declare the base endpoint without query params:

```js
// Declare:
["https://api.weather.com/v1/current"]

// Can call:
✅ https://api.weather.com/v1/current?city=Boston&units=imperial
✅ https://api.weather.com/v1/current?q=London
```

---

## API Key Management

### Check for Existing Keys First

**Before creating a new API key ID**, search the codebase:

```bash
grep -r "apikey_" extensions-official/
```

**Common existing keys** (reuse if applicable):
- `apikey_openai` - OpenAI API
- `apikey_anthropic` - Anthropic/Claude
- `apikey_google` - Google AI/Gemini
- `apikey_openrouter` - OpenRouter
- `apikey_weather` - Weather APIs

### Creating a New API Key ID

If calling a **new service**, create a new key ID:

```js
// Format: apikey_<service_name>
"apikey_stripe"
"apikey_github"
"apikey_sendgrid"
```

**Naming conventions:**
- Use `apikey_` prefix
- Lowercase service name
- No spaces or special characters
- Descriptive but concise

### Using {{API_KEY}} Placeholder

The Swift bridge replaces `{{API_KEY}}` with the actual key value.

**In Headers:**
```js
const headers = JSON.stringify({
  "Authorization": "Bearer {{API_KEY}}",
  "Content-Type": "application/json"
});
```

**In URL:**
```js
const url = `https://api.service.com/endpoint?key={{API_KEY}}&param=value`;
```

**Custom Header Names:**
```js
const headers = JSON.stringify({
  "X-API-Key": "{{API_KEY}}",
  "X-Custom-Header": "some-value"
});
```

### No API Key Needed

Some APIs are public and don't need authentication:

```js
// No API keys declared
new Extension({
  name: "public_api",
  version: "1.0.0",
  endpoints: ["https://api.public.com"],
  requiredAPIKeys: [],  // Empty - no keys needed
  // ... other properties
})

// Use empty string for apiKeyId
const result = callAPI(
  "",  // No API key
  url,
  "GET",
  headers,
  ""
);
```

---

## Complete Examples

### Example 1: Weather API (GET with API Key in URL)

```js
(function() {
  const extensionName = "weather";

  const extensionRoot = new Extension({
    name: extensionName,
    version: "1.0.0",
    endpoints: ["https://api.weatherapi.com/v1"],
    requiredAPIKeys: ["apikey_weather"],
    author: "your_github",
    category: "Utilities",
    dataScope: "none"
  });

  const weather = new Command({
    name: "weather",
    parameters: [
      new Parameter({type: "string", name: "city", helpText: "City name", default: "Boston"})
    ],
    type: "insert",
    helpText: "Get current weather for a city",
    tutorials: [
      new TutorialCommand({command: "weather(Boston)", description: "Get Boston weather"}),
      new TutorialCommand({command: "weather(London)", description: "Get London weather"})
    ],
    extension: extensionRoot
  });

  weather.execute = function(payload) {
    const [city] = this.getParsedParams(payload);

    if (!city?.trim()) {
      return new ReturnObject({status: "error", message: "Please provide a city name."});
    }

    // Build URL with API key placeholder
    const url = `https://api.weatherapi.com/v1/current.json?key={{API_KEY}}&q=${encodeURIComponent(city)}`;
    const headers = JSON.stringify({
      "Content-Type": "application/json"
    });

    // Make API call
    const result = callAPI("apikey_weather", url, "GET", headers, "");

    if (!result.success) {
      return new ReturnObject({status: "error", message: `Weather API error: ${result.error}`});
    }

    // Parse and format response
    const data = JSON.parse(result.data);
    const temp = data.current.temp_f;
    const condition = data.current.condition.text;
    const output = `${city}: ${temp}°F, ${condition}`;

    return new ReturnObject({status: "success", message: "Weather retrieved", payload: output});
  };
})();
```

### Example 2: REST API (POST with API Key in Header)

```js
(function() {
  const extensionName = "task_manager";

  const extensionRoot = new Extension({
    name: extensionName,
    version: "1.0.0",
    endpoints: ["https://api.tasks.com/v1"],
    requiredAPIKeys: ["apikey_tasks"],
    author: "your_github",
    category: "Productivity",
    dataScope: "line"  // Gets current line only
  });

  const create_task = new Command({
    name: "create_task",
    parameters: [
      new Parameter({type: "string", name: "priority", helpText: "Priority (low, medium, high)", default: "medium"})
    ],
    type: "insert",
    helpText: "Create a task from current line",
    tutorials: [
      new TutorialCommand({command: "create_task(high)", description: "Create high priority task"}),
      new TutorialCommand({command: "create_task(low)", description: "Create low priority task"})
    ],
    extension: extensionRoot
  });

  create_task.execute = function(payload) {
    const [priority] = this.getParsedParams(payload);
    const taskText = payload.fullText?.trim();

    if (!taskText) {
      return new ReturnObject({status: "error", message: "No task text provided."});
    }

    // Prepare POST request
    const url = "https://api.tasks.com/v1/tasks";
    const headers = JSON.stringify({
      "Content-Type": "application/json",
      "Authorization": "Bearer {{API_KEY}}"  // Key in header
    });
    const body = JSON.stringify({
      title: taskText,
      priority: priority,
      status: "todo"
    });

    // Make API call
    const result = callAPI("apikey_tasks", url, "POST", headers, body);

    if (!result.success) {
      return new ReturnObject({status: "error", message: `Failed to create task: ${result.error}`});
    }

    const data = JSON.parse(result.data);
    return new ReturnObject({status: "success", message: "Task created", payload: `Task #${data.id} created`});
  };
})();
```

### Example 3: Public API (No Authentication)

```js
(function() {
  const extensionName = "dad_joke";

  const extensionRoot = new Extension({
    name: extensionName,
    version: "1.0.0",
    endpoints: ["https://icanhazdadjoke.com"],
    requiredAPIKeys: [],  // No API key needed
    author: "your_github",
    category: "Fun",
    dataScope: "none"
  });

  const joke = new Command({
    name: "joke",
    parameters: [],
    type: "insert",
    helpText: "Insert a random dad joke",
    tutorials: [
      new TutorialCommand({command: "joke", description: "Get a random dad joke"})
    ],
    extension: extensionRoot
  });

  joke.execute = function(payload) {
    const url = "https://icanhazdadjoke.com/";
    const headers = JSON.stringify({
      "Accept": "application/json"
    });

    // No API key - use empty string
    const result = callAPI("", url, "GET", headers, "");

    if (!result.success) {
      return new ReturnObject({status: "error", message: `Failed to fetch joke: ${result.error}`});
    }

    const data = JSON.parse(result.data);
    return new ReturnObject({status: "success", message: "Joke retrieved", payload: data.joke});
  };
})();
```

---

## Best Practices

### 1. Always Validate User Input

```js
// URL encoding for safety
const safeCity = encodeURIComponent(city);
const url = `https://api.service.com?q=${safeCity}`;

// Validation
if (!input?.trim()) {
  return new ReturnObject({status: "error", message: "Input required."});
}
```

### 2. Handle Errors Gracefully

```js
if (!result.success) {
  // Provide helpful error message
  return new ReturnObject({
    status: "error",
    message: `API call failed: ${result.error}. Please check your API key in Preferences.`
  });
}

// Validate response structure
try {
  const data = JSON.parse(result.data);
  if (!data.expected_field) {
    return new ReturnObject({status: "error", message: "Unexpected API response format."});
  }
} catch (e) {
  return new ReturnObject({status: "error", message: "Failed to parse API response."});
}
```

### 3. Document API Key Setup

In your extension's README.md:

```markdown
## Setup

This extension requires a Weather API key.

### Getting an API Key

1. Visit https://www.weatherapi.com/
2. Sign up for a free account
3. Copy your API key from the dashboard

### Configuring in Antinote

1. Open **Antinote > Preferences > Extensions > API Keys**
2. Click **Add API Key**
3. Enter:
   - **Name**: `Weather API`
   - **Keychain Key**: `apikey_weather`
   - **API Key Value**: Your API key from step 3

That's it! The extension will now work.
```

### 4. Use Preferences for Configuration

```js
// Let users configure base URL, units, etc.
const unitPref = new Preference({
  key: "temperature_unit",
  label: "Temperature Unit",
  type: "selectOne",
  defaultValue: "fahrenheit",
  options: ["fahrenheit", "celsius"],
  helpText: "Choose temperature unit for weather"
});
extensionRoot.register_preference(unitPref);

// Use in command
const unit = getExtensionPreference(extensionName, "temperature_unit");
```

### 5. Rate Limiting

Be mindful of API rate limits:

```js
// Don't make excessive calls in loops
// Consider caching responses if appropriate
// Provide user feedback about rate limits
```

---

## Common Patterns

### Pattern 1: Pagination

```js
const fetchPage = (page) => {
  const url = `https://api.service.com/items?page=${page}&limit=10`;
  return callAPI("apikey_service", url, "GET", headers, "");
};

// Fetch multiple pages if needed
let allItems = [];
for (let page = 1; page <= 3; page++) {
  const result = fetchPage(page);
  if (result.success) {
    const data = JSON.parse(result.data);
    allItems = allItems.concat(data.items);
  }
}
```

### Pattern 2: Different Endpoints in Same Extension

```js
// Declare multiple endpoints
new Extension({
  name: "github",
  version: "1.0.0",
  endpoints: [
    "https://api.github.com/users",
    "https://api.github.com/repos",
    "https://api.github.com/gists"
  ],
  requiredAPIKeys: ["apikey_github"],
  // ... other properties
})

// Use different endpoints in different commands
const getUserInfo = () => callAPI("apikey_github", "https://api.github.com/users/...", ...);
const getRepos = () => callAPI("apikey_github", "https://api.github.com/repos/...", ...);
```

### Pattern 3: Response Caching

```js
let cache = {};

my_command.execute = function(payload) {
  const cacheKey = "data";

  // Check cache first
  if (cache[cacheKey]) {
    return new ReturnObject({status: "success", message: "From cache", payload: cache[cacheKey]});
  }

  // Make API call
  const result = callAPI(...);
  if (result.success) {
    cache[cacheKey] = result.data;
  }

  return result;
};
```

---

## Troubleshooting

### "Endpoint not in allowlist"

**Cause:** URL doesn't match declared endpoints

**Fix:** Add the endpoint to your extension declaration:
```js
new Extension({
  name: "name",
  version: "1.0.0",
  endpoints: ["https://api.newservice.com/v1"],  // Add this
  // ... other properties
})
```

### "API key not found"

**Cause:** User hasn't configured the API key

**Fix:** Provide clear setup instructions in README

### "Invalid JSON response"

**Cause:** API returned non-JSON (HTML error page, etc.)

**Fix:**
```js
try {
  const data = JSON.parse(result.data);
} catch (e) {
  return new ReturnObject({status: "error", message: `API returned invalid response: ${result.data.substring(0, 100)}`});
}
```

### CORS Errors

**Won't happen!** The Swift bridge makes actual HTTP requests, not browser XMLHttpRequest. No CORS restrictions.

---

## Security Checklist

Before publishing your network extension:

- [ ] All endpoints declared in extension metadata
- [ ] Checked for existing API key IDs (reuse if possible)
- [ ] Never hardcoded API keys in code
- [ ] Used `{{API_KEY}}` placeholder correctly
- [ ] Validated all user inputs
- [ ] URL-encoded user inputs in URLs
- [ ] Handled API errors gracefully
- [ ] Documented API key setup in README
- [ ] Tested without API key configured
- [ ] Tested with invalid API key
- [ ] Tested with network errors

---

## Resources

- [Security Guide](SECURITY.md) - Understanding security architecture
- [API Reference](../README.md#-api-reference) - Complete API documentation
- [Official Extensions](../extensions-official/) - Reference implementations

---

Happy building! 🌐✨
