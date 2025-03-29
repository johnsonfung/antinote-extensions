// Command constructor function
// At the top of Antinote.js
if (typeof global === 'undefined') { var global = this; }
global.commandRegistry = new Array();

function Command(name, parameters, aliases, type, helpText, tutorials, extension) {
  this.name = name;
  this.parameters = parameters || [];
  this.aliases = aliases || [];
  this.extension = extension;
  this.type = type || "replaceLine";     // Types: replaceAll, replaceLine, openURL
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
        rawValue = this.parameters[i].default_value;
      }
      
      // Parse the value based on the parameter type.
      var parsedValue;
      switch (this.parameters[i].parameter_type) {
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
function Extension(name, version) {
  this.name = name;
  this.version = version || "1.0.0";
  this.commands = [];
}

Extension.prototype.register_command = function(cmd) {
  this.commands.push(cmd);
};

// Parameter constructor function
function Parameter(parameter_type, name, helpText, default_value) {
  this.parameter_type = parameter_type;
  this.name = name;
  this.helpText = helpText || "This parameter needs help text."
  this.default_value = (default_value !== undefined) ? default_value : null;
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