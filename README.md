# ✨ Antinote Extensions

Antinote supports custom JavaScript (ES6) extensions that let you add text to your note, modify your note, or open a URL/URI. Extensions can work locally or make network requests to external APIs. This guide walks you through creating an extension from scratch.

---

## 📚 Documentation

**Building Specific Types of Extensions:**
- 🌐 **[Network Extensions](docs/NETWORK_EXTENSIONS.md)** - Call external APIs safely and securely
- 🤖 **[AI & LLM Extensions](docs/AI_EXTENSIONS.md)** - Build AI-powered extensions using the centralized AI service
- 🔒 **[Security & Privacy Guide](docs/SECURITY.md)** - Understanding security architecture and best practices

**Reference:**
- 📖 **[Official Extensions Index](extensions-official/EXTENSIONS_INDEX.md)** - Complete catalog of all official extensions

---

## 📦 Extension Basics

An extension is a container for one or more commands, implemented as a single JavaScript file. Each extension has:

- A **name** (e.g., "random", "openai", "math")
- A **version** (e.g., "1.0.0")
- **Author** information (GitHub username recommended)
- A **category** for organization (e.g., "AI", "Math", "Date & Time")
- A **data scope** defining what note content the extension can access
- One or more **commands**
- Optional **preferences** for user configuration
- Optional **API endpoints** and **required API keys** for network extensions

### Extension Folder

By default, extensions are stored in:
```
~/Library/Application Support/Antinote/Extensions
```

You can customize this location in **Preferences > Extensions > Choose Folder**.

To open the default folder from Terminal:
```sh
open ~/Library/Application\ Support/Antinote/Extensions
```

---

## 🚀 Using Extensions

To use an extension:

1. Download the extension's JavaScript file
2. Place it in the Extensions folder (or your custom folder)
3. Go to **Preferences > Extensions** and click **Reload Extensions**

Then you can use any command from the extension **inside Antinote** using the syntax:
```
::command_name(arg1, arg2, ...)
```

For example, to generate a random number between 10 and 20:
```
::random_number(10, 20)
```

Press **Tab** or **Enter** to execute the command.

---

## 🧠 Creating an Extension

_Note_: Antinote Extensions uses [JavaScriptCore](https://developer.apple.com/documentation/javascriptcore), which supports **full ES6 (ECMAScript 2015)** features on macOS 14+. You can use modern JavaScript including `const`/`let`, arrow functions, template literals, destructuring, spread operators, and more.

### Basic Extension Structure

Wrap your extension in an IIFE (Immediately Invoked Function Expression) to avoid variable conflicts:

```js
(function() {
  var extensionName = "my_extension";

  // Create the extension root
  var extensionRoot = new Extension({
    name: extensionName,      // Name of your extension
    version: "1.0.0",         // Version
    endpoints: [],            // API endpoints (if making network requests)
    requiredAPIKeys: [],      // Required API key IDs
    author: "your_github",    // Author (GitHub username)
    category: "Utilities",    // Category
    dataScope: "none",        // Data scope: "none", "line", or "full"
    dependencies: [],         // Dependencies (optional - other extensions this depends on)
    isService: false          // isService (optional - true if this provides services to other extensions)
  });

  // Define commands here...
})();
```

### Extension Parameters

#### `Extension({name, version, endpoints, requiredAPIKeys, author, category, dataScope, dependencies, isService})`

- **`name`** (string): Unique name for your extension
- **`version`** (string): Version number (e.g., "1.0.0")
- **`endpoints`** (array): URLs your extension calls (e.g., `["https://api.example.com"]`)
- **`requiredAPIKeys`** (array): API key IDs needed (e.g., `["apikey_openai"]`)
- **`author`** (string): Your GitHub username or name
- **`category`** (string): Category for organization (e.g., "AI", "Math", "Date & Time", "Utilities")
- **`dataScope`** (string): Data access level - see [Data Privacy](#-data-privacy--scopes) below
- **`dependencies`** (array, optional): Other extension names this depends on (e.g., `["ai_providers"]`)
- **`isService`** (boolean, optional): Set to `true` if this extension provides services for other extensions (default: `false`)

---

## 🔐 Data Privacy & Scopes

Extensions must declare what note content they need access to. This is shown to users in the Extensions settings.

### Data Scope Options

- **`"none"`** - Extension receives NO note content (most private)
  - Use for: Date/time generators, calculators, random generators
  - Example: `::today()`, `::tomorrow()`, `::random_number(1, 100)`

- **`"line"`** - Extension receives only the current line where command is used
  - Use for: Single-line processors, current context operations
  - Example: AI commands that process current line only

- **`"full"`** - Extension receives entire note content
  - Use for: Global search/replace, full-text analysis
  - ⚠️ Users will see this requires full note access

**Important**: Choose the minimum scope needed. Users can see the data scope in Preferences > Extensions.

📖 **[Read full Security & Privacy Guide](docs/SECURITY.md)** - Understanding security architecture, API key management, and best practices

---

## 📝 Creating Commands

Each command within an extension can have:

- A **name** (snake_case recommended)
- **Parameters** with types, names, help text, and defaults
- A **type** that defines how it modifies the note
- **Tutorial examples** showing usage
- An **execute function** with your logic

### Command Structure

```js
var my_command = new Command({
  name: "my_command",  // Command name (what user types)

  // Parameters array
  parameters: [
    new Parameter({type: "float", name: "from", helpText: "Bottom range", default: 0}),
    new Parameter({type: "float", name: "to", helpText: "Top range", default: 100}),
    new Parameter({type: "bool", name: "int", helpText: "Round to nearest whole number", default: true})
  ],

  type: "replaceLine", // Type: "insert", "replaceLine", "replaceAll", "openURL"

  helpText: "Generate a random number between two values.",  // Help text

  // Tutorial examples
  tutorials: [
    new TutorialCommand({command: "my_command", description: "Generate a random number from 0 to 100"}),
    new TutorialCommand({command: "my_command(10, 20)", description: "Generate from 10 to 20"}),
    new TutorialCommand({command: "my_command(10, 20, false)", description: "Generate decimal from 10 to 20"})
  ],

  extension: extensionRoot  // Parent extension
});
```

### Command Types

- **`"insert"`** - Insert text after the command
- **`"replaceLine"`** - Replace the entire line with result
- **`"replaceAll"`** - Replace all note text with result
- **`"openURL"`** - Open a URL/URI in the default browser

### Parameters

```js
new Parameter({type, name, helpText, default})
```

**Parameter Types:**
- `"float"` - Decimal numbers
- `"int"` - Whole numbers
- `"bool"` - true/false (accepts: true, false, "true", "false")
- `"string"` - Text (use quotes if contains commas: `"hello, world"`)
- `"paragraph"` - Multi-line text editor (shown as textarea in UI)

---

## ⚙️ Writing the Execute Function

Define the command behavior by assigning an `execute` function:

```js
my_command.execute = function(payload) {
  // Parse parameters automatically (respects types and defaults)
  var [from, to, int] = this.getParsedParams(payload);

  // Validate inputs
  if (from > to) {
    return new ReturnObject({status: "error", message: "The 'from' value cannot be greater than 'to'."});
  }

  // Execute logic
  var result = Math.random() * (to - from) + from;
  if (int) {
    result = Math.floor(result);
  }

  // Return result
  return new ReturnObject({status: "success", message: "Random number generated.", payload: result});
};
```

### Payload Structure

Your function receives a `payload` object:

```js
{
  parameters: ["10", "20", "true"],  // Raw parameter values
  fullText: "...",                   // Note content (based on dataScope)
  userSettings: {
    decimalSeparator: ".",
    thousandsSeparator: ","
  }
}
```

**Note**: `fullText` content depends on your extension's `dataScope`:
- `"none"` → `fullText` is empty string `""`
- `"line"` → `fullText` is current line only
- `"full"` → `fullText` is entire note

### Return Object

```js
new ReturnObject({status, message, payload})
```

- **`status`**: `"success"` or `"error"`
- **`message`**: User-friendly message shown in notification
- **`payload`**: Result string (for success) or empty (for error)

---

## 🌐 Network Extensions & API Keys

Extensions can make external API calls using the secure `callAPI` bridge function. Antinote's Swift bridge ensures API keys are never exposed to JavaScript code.

### Quick Example

```js
// 1. Declare endpoints and API keys
const extensionRoot = new Extension({
  name: "weather",
  version: "1.0.0",
  endpoints: ["https://api.weatherapi.com/v1"],  // Endpoints
  requiredAPIKeys: ["apikey_weather"],            // Required keys
  author: "your_github",
  category: "Utilities",
  dataScope: "none"
});

// 2. Make API call
my_command.execute = function(payload) {
  const url = `https://api.weatherapi.com/v1/current.json?key={{API_KEY}}&q=Boston`;
  const result = callAPI("apikey_weather", url, "GET", JSON.stringify({}), "");

  if (!result.success) {
    return new ReturnObject({status: "error", message: `API failed: ${result.error}`});
  }

  const data = JSON.parse(result.data);
  return new ReturnObject({status: "success", message: "Weather retrieved", payload: data.current.temp_f + "°F"});
};
```

### Security Features

- **API keys never exposed** - Stored in macOS Keychain, accessed only by Swift
- **Endpoint validation** - Swift verifies all URLs match declared endpoints (prefix matching)
- **Extension identity verification** - Extensions cannot impersonate each other
- **`{{API_KEY}}` placeholder** - Replaced by Swift with actual key value

📖 **[Read full Network Extensions Guide](docs/NETWORK_EXTENSIONS.md)** - Complete examples, API reference, patterns, and troubleshooting

---

## 🎛 Extension Preferences

Extensions can define user-configurable preferences that appear in Settings.

### Registering Preferences

```js
// After creating extensionRoot, register preferences
var modelPref = new Preference({
  key: "model",                       // Key (used in code)
  label: "OpenAI Model",              // Label (shown to user)
  type: "selectOne",                  // Type: "bool", "string", "selectOne", "selectMultiple"
  defaultValue: "gpt-4o",             // Default value
  options: ["gpt-4o", "gpt-4o-mini"], // Options (for select types)
  helpText: "Select which model to use" // Help text
});
extensionRoot.register_preference(modelPref);
```

### Preference Types

- **`"bool"`** - Toggle on/off
- **`"string"`** - Free text input
- **`"paragraph"`** - Multi-line text editor (textarea)
- **`"selectOne"`** - Dropdown with single selection
- **`"selectMultiple"`** - Multiple checkboxes

### Using Preferences in Code

```js
my_command.execute = function(payload) {
  // Get preference value
  var model = getExtensionPreference("openai", "model") || "gpt-4o";

  console.log("Using model:", model);
  // ... use in your logic
};
```

---

## 🤖 AI & LLM Extensions

Antinote provides a centralized **AI Providers Service** (`ai_providers`) that handles all AI/LLM integrations. Instead of calling AI APIs directly, use this service for a unified, maintainable approach.

### Why Use the AI Service?

- **Unified Interface** - Single API for OpenAI, Anthropic, Google AI, OpenRouter, and Ollama
- **User Configuration** - Users configure their preferred provider and API keys once
- **No Duplicate Code** - Don't reimplement AI provider logic in each extension
- **Centralized Updates** - Provider changes update all AI extensions automatically

### Quick Example

```js
// 1. Declare dependency on ai_providers
const extensionRoot = new Extension({
  name: "my_ai_extension",
  version: "1.0.0",
  endpoints: [],              // No endpoints - ai_providers handles this
  requiredAPIKeys: [],        // No API keys - ai_providers handles this
  author: "your_github",
  category: "AI & ML",
  dataScope: "full",
  dependencies: ["ai_providers"], // Dependency
  isService: false
});

// 2. Use the AI service
my_command.execute = function(payload) {
  // Check availability
  if (typeof callAIProvider === 'undefined') {
    return new ReturnObject({status: "error", message: "AI Providers service not available."});
  }

  const fullText = payload.fullText || "";

  // Call AI with custom prompt
  const result = callAIProvider(fullText, {
    systemPrompt: "Summarize the following text concisely.",
    maxTokens: 200,
    temperature: 0.7
  });

  return result;
};
```

### Available Options

```js
callAIProvider(prompt, {
  provider: "openai",        // Override user's default
  model: "gpt-4o",           // Override user's model
  systemPrompt: "You are...", // Custom instructions
  maxTokens: 150,            // Max response tokens
  temperature: 0.7           // Creativity (0.0-2.0)
})
```

📖 **[Read full AI Extensions Guide](docs/AI_EXTENSIONS.md)** - Complete examples, best practices, and patterns

---

## 🔌 Service Extensions & Dependencies

Service extensions provide reusable functionality for other extensions. The `ai_providers` extension is the primary example.

### Using a Service

Declare the dependency and check availability:

```js
const extensionRoot = new Extension({
  name: "my_extension",
  version: "1.0.0",
  endpoints: [],
  requiredAPIKeys: [],
  author: "your_github",
  category: "Utilities",
  dataScope: "none",
  dependencies: ["ai_providers"],  // Depends on ai_providers
  isService: false
});

my_command.execute = function(payload) {
  // Always check if service is available
  if (typeof callAIProvider === 'undefined') {
    return new ReturnObject({status: "error", message: "AI Providers service not available."});
  }

  // Use the service
  const result = callAIProvider(text, options);
  return result;
};
```

### Creating a Service

Set `isService: true` and export global functions:

```js
const extensionRoot = new Extension({
  name: "my_service",
  version: "1.0.0",
  endpoints: [],
  requiredAPIKeys: [],
  author: "your_github",
  category: "Services",
  dataScope: "none",
  dependencies: [],
  isService: true  // This is a service
});

function myServiceFunction(input) {
  // ... service logic
  return new ReturnObject({status: "success", message: "Processed", payload: result});
}

// Export globally
if (typeof global !== 'undefined') {
  global.myServiceFunction = myServiceFunction;
}
```

📖 **See [AI Extensions Guide](docs/AI_EXTENSIONS.md)** for detailed service extension examples

---

## 🐞 Debugging

### Enable Extension Logging

1. Go to **Preferences > Extensions**
2. Toggle **Enable Extension Logging**
3. View logs at the bottom of the Extensions preferences

### Console Logging

Use standard console methods in your code:

```js
console.log("Debug info:", value);
console.warn("Warning message");
console.error("Error details:", error);
```

These will appear in:
- Extensions Logging UI (if enabled)
- Terminal output (if launched from command line)

### Terminal Debugging

Launch Antinote from Terminal to see all logs:

```sh
open /Applications/Antinote.app
```

Look for:
- `JS console.log:` - Your extension's console output
- `Extensions -` - Swift-side extension loading logs

---

## 📚 Complete Example

Here's a complete extension with preferences, error handling, and best practices:

```js
(function() {
  var extensionName = "random";

  var extensionRoot = new Extension({
    name: extensionName,
    version: "1.0.0",
    endpoints: [],         // No network calls
    requiredAPIKeys: [],   // No API keys
    author: "johnsonfung",
    category: "Random Generators",
    dataScope: "none"      // Doesn't need note content
  });

  var random_number = new Command({
    name: "random_number",
    parameters: [
      new Parameter({type: "float", name: "from", helpText: "Bottom range", default: 0}),
      new Parameter({type: "float", name: "to", helpText: "Top range", default: 100}),
      new Parameter({type: "bool", name: "int", helpText: "Round to nearest whole number", default: true})
    ],
    type: "replaceLine",
    helpText: "Generate a random number between two values.",
    tutorials: [
      new TutorialCommand({command: "random_number", description: "Generate random integer 0-100"}),
      new TutorialCommand({command: "random_number(10, 20)", description: "Generate random integer 10-20"}),
      new TutorialCommand({command: "random_number(10, 20, false)", description: "Generate decimal 10-20"})
    ],
    extension: extensionRoot
  });

  random_number.execute = function(payload) {
    var [from, to, int] = this.getParsedParams(payload);

    // Validation
    if (from > to) {
      return new ReturnObject({status: "error", message: "'from' cannot be greater than 'to'."});
    }
    if (from < 0 || to < 0) {
      return new ReturnObject({status: "error", message: "Values cannot be negative."});
    }

    // Logic
    var result = Math.random() * (to - from) + from;
    if (int) {
      result = Math.floor(result);
    }

    return new ReturnObject({status: "success", message: "Random number generated.", payload: result});
  };
})();
```

---

## 🤝 Contributing

We welcome community contributions! To submit your extension:

1. **Fork this repository**
2. **Create your extension folder** in `extensions-unofficial/your-extension-name/` with:
   - `index.js` - Your extension code
   - `extension.json` - Metadata (name, version, author, category, dataScope, endpoints, requiredAPIKeys, commands)
   - `README.md` - Documentation and usage examples
   - `index.test.js` - Test file to verify your extension works
3. **Run validation and tests locally** before submitting:
   ```sh
   npm install
   npm run validate    # Validates metadata and security disclosures
   npm run test        # Runs all validation and extension tests
   ```
4. **Fix any validation errors** - All extensions must:
   - Include all required metadata fields
   - Declare all API endpoints they call
   - Declare all API keys they require
   - Have accurate data scope declarations
   - Pass their own test suite
5. **Submit a pull request** with:
   - All four required files (index.js, extension.json, README.md, index.test.js)
   - Clear description of what it does
   - Usage examples

**⚠️ PR Requirements**: All pull requests must pass the automated validation and test suite before being reviewed. The CI workflow will automatically run when you submit your PR. If the checks fail, please fix the issues and push updates.

### Official Extensions

To become an official extension (included with Antinote by default):

1. Start as an unofficial extension
2. Demonstrate community value and usage
3. Must meet criteria:
   - Aligns with Antinote's simplicity philosophy
   - Provides clear, focused value
   - Well-documented and tested
   - Follows security best practices
   - Declares minimal necessary data scope
   - Passes all validation and security disclosure checks

---

## 📖 API Reference

### Constructors

#### `Extension({name, version, endpoints, requiredAPIKeys, author, category, dataScope, dependencies, isService})`
Creates extension container.
- **dependencies** (optional): Array of extension names this depends on
- **isService** (optional): Boolean - true if providing services to other extensions

#### `Command({name, parameters, type, helpText, tutorials, extension})`
Registers a command (note: aliases parameter has been removed).

#### `Parameter({type, name, helpText, default})`
Defines command parameter.
- Types: `"float"`, `"int"`, `"bool"`, `"string"`, `"paragraph"`

#### `TutorialCommand({command, description})`
Example usage for users.

#### `Preference({key, label, type, defaultValue, options, helpText})`
User-configurable preference.
- Types: `"bool"`, `"string"`, `"paragraph"`, `"selectOne"`, `"selectMultiple"`

#### `ReturnObject({status, message, payload})`
Standard return value.
- Status: `"success"` or `"error"`

### Functions

#### `this.getParsedParams(payload)`
Parses parameters based on types and applies defaults.

#### `getExtensionPreference(extensionName, key)`
Gets preference value for an extension.

#### `callAPI(apiKeyId, url, method, headers, body)`
Makes authenticated API call (for network extensions).
- Extension identity is automatically determined by the system for security
- Cannot be spoofed by malicious extensions

---

## 🔒 Security & Privacy

- Extensions run in a sandboxed JavaScript context
- API keys stored securely in macOS Keychain
- Users can see what data each extension accesses
- Network extensions clearly marked in settings
- All API endpoints and keys visible to users before use

---

## 💡 Tips & Best Practices

1. **Choose minimal data scope** - Use `"none"` or `"line"` when possible
2. **Validate all inputs** - Return clear error messages
3. **Use console.log()** for debugging - Enable logging in settings
4. **Provide good examples** - Tutorial commands help users understand
5. **Handle errors gracefully** - Always return a ReturnObject
6. **Use modern JavaScript** - ES6 features available (const/let, arrow functions, template literals, etc.)
7. **Document your code** - Add comments explaining logic
8. **Test edge cases** - Invalid inputs, empty values, etc.

---

## 📚 Extension Catalog

For a complete list of all official extensions and their commands, see:
**[Official Extensions Index](extensions-official/EXTENSIONS_INDEX.md)**

This catalog includes:
- All extensions organized by category
- Complete command reference with parameters
- Usage examples for every command
- Data scope and network access information

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/johnsonfung/antinote-extensions/issues)
- **Discussions**: [GitHub Discussions](https://github.com/johnsonfung/antinote-extensions/discussions)
- **Examples**: Check `extensions-official/` for reference implementations

---

Happy extending! 🚀
