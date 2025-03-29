# ✨ Antinote Extensions

Antinote supports simple custom JavaScript (ES5) extensions that let you add text to your note, modify your note, or open a URL/URI based on the content of your note. This guide walks you through creating an extension from scratch.

---

## 📦 Extension Basics

An extension is a container for one or more commands, implemented as a single JavaScript file. Each extension has:

- A **name** (e.g., "random", "date", "math")
- A **version** (e.g., "1.0.0")
- One or more commands

All user extensions are stored in:
```
~/Library/Containers/com.chabomakers.Antinote/Data/Library/Application Support/Antinote/Extensions
```

To open it from Terminal:

```sh
open ~/Library/Containers/com.chabomakers.Antinote/Data/Library/Application\ Support/Antinote/Extensions
```
---

## 🚀 Using Extensions

To use an extension:

1. Download the extension's JavaScript file
2. Place it in the Extensions folder
3. Restart Antinote

Then you can use any command from the extension **inside Antinote** using the syntax:
```
** command_name(arg1, arg2, ...)
```

For example, to generate a random number between 10 and 20:
```
** random_number(10, 20)
```

Note that this "**" syntax is temporary until Antinote has a proper command palette where users will be able to quickly search and apply extensions.

---

## 🧠 Creating an Extension

_Note_: Antinote Extensions uses [JavaScriptCore](https://developer.apple.com/documentation/javascriptcore) to parse JS, which means that you are generally limited to ES5.

Start every extension by creating a new `Extension`:

```js
var extensionRoot = new Extension("my_extension_name", "1.0.0");
```

Each command within an extension can have:

- A **name** and optional **aliases**
- **Parameters** with:
  - `parameterType`  : float, int, bool, or string
  - `name`: string (for use in your logic)
  - `helpText`: string (explaining the parameter to users)
  - `defaultValue`: float, int, bool, or string (matching your type)
- A **function** that defines what the command does
- Optional **tutorial examples** showing how to use it


Use the `Command` constructor to define a new command:

```js
var my_command = new Command(
  "my_command", // command name

  // parameter definitions
  [
    new Parameter("float", "from", "Bottom range", 0),
    new Parameter("float", "to", "Top range", 100),
    new Parameter("bool", "int", "Round to nearest whole number", true)
  ],

  ["alias1", "alias2"], // up to 3 aliases

  "replaceLine", // action type: "replaceLine", "replaceAll", or "openURL"

  "Generate a random number between two values.", // help text

  [ // tutorial examples
    new TutorialCommand("my_command", "Generate a random number from 0 to 100."),
    new TutorialCommand("my_command(10, 20)", "Generate a random number from 10 to 20."),
    new TutorialCommand("my_command(10, 20, false)", "Generate a decimal number from 10 to 20.")
  ],

  extensionRoot // parent extension
);
```

---

## ⚙️ Writing the Function

Define the command behavior by assigning an `execute` function:

```js
my_command.execute = function(payload) {
  var [from, to, int] = this.getParsedParams(payload);

  var result = Math.random() * (to - from) + from;
  if (int) {
    result = Math.floor(result);
  }

  return new ReturnObject("success", "Random number generated.", result);
};
```

---

## ⚠️ Error Handling

Always validate your inputs and return appropriate error messages when something goes wrong. Here's an example:

```js
my_command.execute = function(payload) {
  var [from, to, int] = this.getParsedParams(payload);

  // Validate inputs
  if (from > to) {
    return new ReturnObject("error", "The 'from' value cannot be greater than the 'to' value.");
  }
  
  if (from < 0 || to < 0) {
    return new ReturnObject("error", "Values cannot be negative.");
  }

  // Process valid inputs
  var result = Math.random() * (to - from) + from;
  if (int) {
    result = Math.floor(result);
  }

  return new ReturnObject("success", "Random number generated.", result);
};
```

The `ReturnObject` takes three parameters:
- `status`: Either "success" or "error"
- `message`: A user-friendly message explaining what happened
- `payload`: The result (for success) or empty string (for error)

---

## 🧪 Sample: Random Letters

```js
var random_letters = new Command(
  "random_letters",
  [ new Parameter("int", "numberOfLetters", "Number of letters to generate", 1) ],
  [],
  "replaceLine",
  "Generate random letters.",
  [
    new TutorialCommand("random_letters", "Generate 1 random letter."),
    new TutorialCommand("random_letters(5)", "Generate 5 random letters.")
  ],
  extensionRoot
);

random_letters.execute = function(payload) {
  var [count] = this.getParsedParams(payload);
  var result = "";
  for (var i = 0; i < count; i++) {
    result += String.fromCharCode(65 + Math.floor(Math.random() * 26));
  }
  return new ReturnObject("success", "Random letters generated.", result);
};
```

---

## 🛠 API Reference

### `new Extension(name, version)`
Creates a new extension container.

- `name`: The name of your extension
- `version`: The version of your extension (optional, defaults to "1.0.0")

---

### `new Command(name, parameters, aliases, type, helpText, tutorials, extension)`
Registers a new command.

- `type`: `"replaceLine"`, `"replaceAll"`, or `"openURL"`
- `tutorials`: Array of `TutorialCommand` instances

---

### `new Parameter(type, name, helpText, defaultValue)`
Defines a command parameter.

- `type`: `"float"`, `"int"`, `"bool"`, or `"string"`

---

### `new TutorialCommand(command, description)`
Example usage to help users understand the command.

---

### Payload Format
Commands receive a payload from Antinote like this:

```json
{
  "parameters": ["10", "20", "true"],
  "fullText": "Full text of the note from the user",
  "userSettings": {
    "decimalSeparator": ".",
    "thousandsSeparator": ","
  }
}
```

---

### `ReturnObject(status, message, payload)`
Standard object returned from a command.

- `status`: `"success"` or `"error"`
- `message`: Message shown to user
- `payload`: The result (string to insert or URL to open)

---

## 🤝 Contributing

We welcome community contributions! Here's how to submit your extension:

1. Create a pull request with your extension's JavaScript file
2. Your extension will be reviewed and added to the unofficial extensions directory
3. To make your extension official (included with Antinote by default), it will need to undergo additional review to ensure it:
   - Aligns with Antinote's core value proposition
   - Maintains a simple, intuitive user experience
   - Provides clear user value
   - Follows best practices for extension development

---

## 🐞 Debugging

If you launch Antinote from Terminal, any `console.log()` or `console.error()` output from your extensions will be printed in the terminal prefixed with `JS console.log`.

There is also logging on the Swift side of things, prefixed with `Extensions -`. These logs will show you which functions were loaded.

At the moment there is no checking or validating of extensions. The base JS file is loaded and then every extension is loaded afterwards to create a single JS context. Validation will be implemented later.

---

## 📂 Extension Folder

Extensions are stored in:

```
~/Library/Containers/com.chabomakers.Antinote/Data/Library/Application Support/Antinote/Extensions
```

To open it from Terminal:

```sh
open ~/Library/Containers/com.chabomakers.Antinote/Data/Library/Application\ Support/Antinote/Extensions
```

---
