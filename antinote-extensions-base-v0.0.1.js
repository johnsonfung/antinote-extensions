// Command constructor function
// At the top of Antinote.js
if (typeof global === 'undefined') { var global = this; }
global.commandRegistry = new Array();

function Command(name, parameters, type, helpText, tutorials, extension) {
  this.name = name;
  this.parameters = parameters || [];
  this.extension = extension;
  this.type = type || "replaceLine";     // Types: insert, replaceAll, replaceLine, openURL
  this.helpText = helpText ||  "This command replaces text in a line.";
  this.tutorials = tutorials || [];

  if (extension && typeof extension.register_command === "function") {
    extension.register_command(this);
  }

  // Add this command to the global registry
    this.commandRegistry = global.commandRegistry;
  global.commandRegistry.push(this);
}

Command.prototype.getParsedParams = function(payload) {
    var resolved = [];
    
    for (var i = 0; i < this.parameters.length; i++) {
      // Get the raw value from payload.
      var rawValue = payload.parameters?.[i];
      // If missing, use the default from the parameter definition.
      if (rawValue === undefined || rawValue === null) {
        rawValue = this.parameters[i].defaultValue;
      }
      
      // Parse the value based on the parameter type.
      var parsedValue;
      switch (this.parameters[i].parameterType) {
        case "float":
          parsedValue = parseFloat(rawValue);
          break;
        case "int":
          parsedValue = parseInt(rawValue);
          break;
        case "bool":
          // For booleans, we consider both boolean and string representations.
          if (typeof rawValue === "boolean") {
            parsedValue = rawValue;
          } else {
            parsedValue = (rawValue.toString().toLowerCase() === "true");
          }
          break;
        case "string":
        default:
          parsedValue = rawValue.toString();
          break;
      }
      
      resolved.push(parsedValue);
    }
    
    return resolved;
  };

Command.prototype.execute = function() {
  return "Hello, World!";
};

// Extension constructor function
function Extension(name, version, endpoints, requiredAPIKeys, author, category, dataScope, dependencies, isService) {
  this.name = name;
  this.version = version || "1.0.0";
  this.commands = [];
  this.endpoints = endpoints || [];  // Array of endpoint URLs this extension calls
  this.requiredAPIKeys = requiredAPIKeys || [];  // Array of API key IDs this extension requires
  this.preferences = [];  // Array of preference definitions
  this.author = author || "";  // GitHub username or author name
  this.category = category || "Utilities";  // Category for organizing extensions
  // Data access scope: "none" (no note content), "line" (current line only), "full" (entire note)
  this.dataScope = dataScope || "full";  // Default to "full" for backwards compatibility
  this.dependencies = dependencies || [];  // Array of extension names this extension depends on
  this.isService = isService || false;  // Whether this extension is a service (provides functionality for other extensions)
}

Extension.prototype.register_command = function(cmd) {
  this.commands.push(cmd);
};

// Preference constructor function
function Preference(key, label, type, defaultValue, options, helpText) {
  this.key = key;
  this.label = label;
  this.type = type; // "bool", "string", "selectOne", "selectMultiple"
  this.defaultValue = defaultValue;
  this.options = options || null; // Array of strings for select types
  this.helpText = helpText || null;
}

Extension.prototype.register_preference = function(pref) {
  this.preferences.push(pref);
};

// Parameter constructor function
function Parameter(parameterType, name, helpText, defaultValue) {
  this.parameterType = parameterType;
  this.name = name;
  this.helpText = helpText || "This parameter needs help text."
  this.defaultValue = (defaultValue !== undefined) ? defaultValue : null;
}

function TutorialCommand(command, description) {
  this.command = command;
  this.description = description;
}


function ReturnObject(status, message, payload) {
  this.status = status || "error";
  this.message = message || "Undefined error.";
  this.payload = payload || "";
}
