// ===============================
// Antinote Extension: json_tools
// Version 2.0.0
// Multi-file extension with smart extraction
// ===============================

(function () {
  const extensionName = "json_tools";

  // Create extension root
  const extensionRoot = new Extension({
    name: extensionName,
    version: "2.0.1",
    endpoints: [],
    requiredAPIKeys: [],
    author: "johnsonfung",
    category: "Data Tools",
    dataScope: "full"
  });

  // Register preferences
  const formatPref = new Preference({
    key: "format_style",
    label: "JSON Formatting Style",
    type: "selectOne",
    defaultValue: "pretty",
    options: ["pretty", "compact", "minified"],
    helpText: "Default formatting for JSON output: pretty (2-space indent), compact (no indent), or minified (no whitespace)"
  });
  extensionRoot.register_preference(formatPref);

  const keyCasingPref = new Preference({
    key: "key_casing",
    label: "Preferred Key Casing",
    type: "selectOne",
    defaultValue: "snake_case",
    options: ["snake_case", "camelCase", "PascalCase", "kebab-case", "UPPER_CASE", "lowercase"],
    helpText: "Default casing style for JSON keys when converting from CSV"
  });
  extensionRoot.register_preference(keyCasingPref);

  // Create shared namespace for helpers and commands
  const Shared = {};

  // Export to global scope for other files to access
  // Use global object in Node.js environment, or window/this in browser
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;

  if (typeof globalScope.__EXTENSION_SHARED__ === 'undefined') {
    globalScope.__EXTENSION_SHARED__ = {};
  }

  globalScope.__EXTENSION_SHARED__[extensionName] = {
    root: extensionRoot,
    shared: Shared
  };

  // Files after this (helpers and commands) will populate Shared namespace
  // and register commands with extensionRoot
})();
