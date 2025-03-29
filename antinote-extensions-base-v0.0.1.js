// Command constructor function
// At the top of Antinote.js
if (typeof global === 'undefined') { var global = this; }
global.commandRegistry = new Array();

function Command(name, parameters, aliases, type, helpText, extension) {
  this.name = name;
  this.parameters = parameters || [];
  this.aliases = aliases || [];
  this.extension = extension;
  this.type = type || "replaceLine";     // Types: replaceAll, replaceLine, openURL
  this.helpText = helpText ||  "This command replaces text in a line.";


  if (extension && typeof extension.register_command === "function") {
    extension.register_command(this);
  }

  // Add this command to the global registry
    this.commandRegistry = global.commandRegistry;
  global.commandRegistry.push(this);
}

Command.prototype.getResolvedParams = function(payload) {
    var resolved = [];
  
    for (var i = 0; i < this.parameters.length; i++) {
      var value = payload.parameters?.[i]?.value;
      if (value === undefined || value === null) {
        value = this.parameters[i].default_value;
      }
      resolved.push(value);
    }
  
    return resolved;
  };

Command.prototype.execute = function() {
  return "Hello, World!";
};

// Extension constructor function
function Extension(name) {
  this.name = name;
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
