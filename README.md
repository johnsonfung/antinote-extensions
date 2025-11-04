# ✨ Antinote Extensions

Antinote supports custom JavaScript (ES5) extensions that let you add text to your note, modify your note, or open a URL/URI. Extensions can work locally or make network requests to external APIs. This guide walks you through creating an extension from scratch.

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

_Note_: Antinote Extensions uses [JavaScriptCore](https://developer.apple.com/documentation/javascriptcore), which means you are generally limited to ES5 JavaScript.

### Basic Extension Structure

Wrap your extension in an IIFE (Immediately Invoked Function Expression) to avoid variable conflicts:

```js
(function() {
  var extensionName = "my_extension";

  // Create the extension root
  var extensionRoot = new Extension(
    extensionName,      // Name of your extension
    "1.0.0",           // Version
    [],                // API endpoints (if making network requests)
    [],                // Required API key IDs
    "your_github",     // Author (GitHub username)
    "Utilities",       // Category
    "none"             // Data scope: "none", "line", or "full"
  );

  // Define commands here...
})();
```

### Extension Parameters

#### `new Extension(name, version, endpoints, requiredAPIKeys, author, category, dataScope)`

- **`name`** (string): Unique name for your extension
- **`version`** (string): Version number (e.g., "1.0.0")
- **`endpoints`** (array): URLs your extension calls (e.g., `["https://api.example.com"]`)
- **`requiredAPIKeys`** (array): API key IDs needed (e.g., `["apikey_openai"]`)
- **`author`** (string): Your GitHub username or name
- **`category`** (string): Category for organization (e.g., "AI", "Math", "Date & Time", "Utilities")
- **`dataScope`** (string): Data access level - see [Data Privacy](#-data-privacy--scopes) below

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
var my_command = new Command(
  "my_command",        // Command name (what user types)

  // Parameters array
  [
    new Parameter("float", "from", "Bottom range", 0),
    new Parameter("float", "to", "Top range", 100),
    new Parameter("bool", "int", "Round to nearest whole number", true)
  ],

  "replaceLine",       // Type: "insert", "replaceLine", "replaceAll", "openURL"

  "Generate a random number between two values.",  // Help text

  // Tutorial examples
  [
    new TutorialCommand("my_command", "Generate a random number from 0 to 100"),
    new TutorialCommand("my_command(10, 20)", "Generate from 10 to 20"),
    new TutorialCommand("my_command(10, 20, false)", "Generate decimal from 10 to 20")
  ],

  extensionRoot        // Parent extension
);
```

### Command Types

- **`"insert"`** - Insert text after the command
- **`"replaceLine"`** - Replace the entire line with result
- **`"replaceAll"`** - Replace all note text with result
- **`"openURL"`** - Open a URL/URI in the default browser

### Parameters

```js
new Parameter(type, name, helpText, defaultValue)
```

**Parameter Types:**
- `"float"` - Decimal numbers
- `"int"` - Whole numbers
- `"bool"` - true/false (accepts: true, false, "true", "false")
- `"string"` - Text (use quotes if contains commas: `"hello, world"`)

---

## ⚙️ Writing the Execute Function

Define the command behavior by assigning an `execute` function:

```js
my_command.execute = function(payload) {
  // Parse parameters automatically (respects types and defaults)
  var [from, to, int] = this.getParsedParams(payload);

  // Validate inputs
  if (from > to) {
    return new ReturnObject("error", "The 'from' value cannot be greater than 'to'.");
  }

  // Execute logic
  var result = Math.random() * (to - from) + from;
  if (int) {
    result = Math.floor(result);
  }

  // Return result
  return new ReturnObject("success", "Random number generated.", result);
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
new ReturnObject(status, message, payload)
```

- **`status`**: `"success"` or `"error"`
- **`message`**: User-friendly message shown in notification
- **`payload`**: Result string (for success) or empty (for error)

---

## 🌐 Network Extensions & API Keys

Extensions can make external API calls using the `callAPI` bridge function.

### Setting Up API Keys

1. In Antinote, go to **Preferences > Extensions > API Keys**
2. Click **Add API Key**
3. Enter:
   - **Name**: Display name (e.g., "OpenAI")
   - **Keychain Key**: ID for code (e.g., "apikey_openai")
   - **API Key Value**: Your actual API key

### Declaring API Requirements

```js
var extensionRoot = new Extension(
  "openai",
  "1.0.0",
  ["https://api.openai.com/v1/chat/completions"],  // Endpoints
  ["apikey_openai"],                                // Required keys
  "anthropics",
  "AI",
  "line"
);
```

### Making API Calls

```js
my_command.execute = function(payload) {
  var [prompt] = this.getParsedParams(payload);

  // Prepare request
  var url = "https://api.openai.com/v1/chat/completions";
  var headers = JSON.stringify({
    "Content-Type": "application/json",
    "Authorization": "Bearer {{API_KEY}}"  // Replaced automatically
  });
  var body = JSON.stringify({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }]
  });

  // Call API
  var result = callAPI(
    "apikey_openai",    // API key ID
    "openai",           // Extension name
    url,
    "POST",
    headers,
    body
  );

  // Handle response
  if (!result.success) {
    return new ReturnObject("error", "API call failed: " + result.error);
  }

  var data = JSON.parse(result.data);
  var response = data.choices[0].message.content;

  return new ReturnObject("success", "Response received", response);
};
```

**Security**: `{{API_KEY}}` placeholders are replaced with actual keys from the macOS Keychain.

---

## 🎛 Extension Preferences

Extensions can define user-configurable preferences that appear in Settings.

### Registering Preferences

```js
// After creating extensionRoot, register preferences
var modelPref = new Preference(
  "model",                    // Key (used in code)
  "OpenAI Model",            // Label (shown to user)
  "selectOne",               // Type: "bool", "string", "selectOne", "selectMultiple"
  "gpt-4o",                  // Default value
  ["gpt-4o", "gpt-4o-mini"], // Options (for select types)
  "Select which model to use" // Help text
);
extensionRoot.register_preference(modelPref);
```

### Preference Types

- **`"bool"`** - Toggle on/off
- **`"string"`** - Free text input
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

  var extensionRoot = new Extension(
    extensionName,
    "1.0.0",
    [],              // No network calls
    [],              // No API keys
    "johnsonfung",
    "Random Generators",
    "none"           // Doesn't need note content
  );

  var random_number = new Command(
    "random_number",
    [
      new Parameter("float", "from", "Bottom range", 0),
      new Parameter("float", "to", "Top range", 100),
      new Parameter("bool", "int", "Round to nearest whole number", true)
    ],
    "replaceLine",
    "Generate a random number between two values.",
    [
      new TutorialCommand("random_number", "Generate random integer 0-100"),
      new TutorialCommand("random_number(10, 20)", "Generate random integer 10-20"),
      new TutorialCommand("random_number(10, 20, false)", "Generate decimal 10-20")
    ],
    extensionRoot
  );

  random_number.execute = function(payload) {
    var [from, to, int] = this.getParsedParams(payload);

    // Validation
    if (from > to) {
      return new ReturnObject("error", "'from' cannot be greater than 'to'.");
    }
    if (from < 0 || to < 0) {
      return new ReturnObject("error", "Values cannot be negative.");
    }

    // Logic
    var result = Math.random() * (to - from) + from;
    if (int) {
      result = Math.floor(result);
    }

    return new ReturnObject("success", "Random number generated.", result);
  };
})();
```

---

## 🤝 Contributing

We welcome community contributions! To submit your extension:

1. **Fork this repository**
2. **Add your extension** to `extensions-unofficial/`
3. **Test thoroughly** - Ensure it works and handles errors gracefully
4. **Submit a pull request** with:
   - Extension file
   - Clear description of what it does
   - Usage examples

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

---

## 📖 API Reference

### Constructors

#### `Extension(name, version, endpoints, requiredAPIKeys, author, category, dataScope)`
Creates extension container.

#### `Command(name, parameters, type, helpText, tutorials, extension)`
Registers a command (note: aliases parameter has been removed).

#### `Parameter(type, name, helpText, defaultValue)`
Defines command parameter.
- Types: `"float"`, `"int"`, `"bool"`, `"string"`

#### `TutorialCommand(command, description)`
Example usage for users.

#### `Preference(key, label, type, defaultValue, options, helpText)`
User-configurable preference.
- Types: `"bool"`, `"string"`, `"selectOne"`, `"selectMultiple"`

#### `ReturnObject(status, message, payload)`
Standard return value.
- Status: `"success"` or `"error"`

### Functions

#### `this.getParsedParams(payload)`
Parses parameters based on types and applies defaults.

#### `getExtensionPreference(extensionName, key)`
Gets preference value for an extension.

#### `callAPI(apiKeyId, extensionName, url, method, headers, body)`
Makes authenticated API call (for network extensions).

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
6. **Keep it simple** - ES5 only, avoid complex dependencies
7. **Document your code** - Add comments explaining logic
8. **Test edge cases** - Invalid inputs, empty values, etc.

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/johnsonfung/antinote-extensions/issues)
- **Discussions**: [GitHub Discussions](https://github.com/johnsonfung/antinote-extensions/discussions)
- **Examples**: Check `extensions-official/` for reference implementations

---

Happy extending! 🚀
