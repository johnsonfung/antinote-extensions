# ✨ Antinote Extensions

Antinote supports powerful custom JavaScript extensions that let you process and manipulate notes via user-defined commands. This guide walks you through creating an extension from scratch.

---

## 📦 Extension Basics

Each extension consists of:

- A **name**
- One or more **commands**
- Optional **parameter definitions**
- A **function** that defines what your command does
- An optional list of **tutorial examples**

Start every extension by creating a new `Extension`:

```js
var extensionRoot = new Extension("my_extension_name");
```

---

## 🧠 Creating a Command

Use the `Command` constructor to define a new command:

```js
var my_command = new Command(
  "my_command", // command name

  // parameter definitions
  [
    new Parameter("float", "from", "bottom range", 0),
    new Parameter("float", "to", "top range", 100),
    new Parameter("bool", "int", "round to nearest whole number", true)
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

## 🧪 Sample: Random Letters

```js
var random_letters = new Command(
  "random_letters",
  [ new Parameter("int", "numberOfLetters", "how many letters you want", 1) ],
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

### `new Extension(name)`
Creates a new extension container.

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

## 🐞 Debugging

If you launch Antinote from Terminal, any `console.log()` or `console.error()` output from your extensions will be printed in the terminal prefixed with `JS console.log`.

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
