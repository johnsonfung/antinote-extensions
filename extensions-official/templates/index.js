// ===============================
// Antinote Extension: templates
// Version 2.0.0
// Multi-file structure
// ===============================

(function() {
  const extensionName = "templates";

  const extensionRoot = new Extension({
    name: extensionName,
    version: "2.0.0",
    endpoints: [],
    requiredAPIKeys: [],
    author: "johnsonfung",
    category: "Productivity",
    dataScope: "none"
  });

  // Register preferences for custom templates using a loop
  for (let i = 1; i <= 10; i++) {
    const pref = new Preference({
      key: `custom_template_${i}`,
      label: `Custom Template ${i}`,
      type: "paragraph",
      defaultValue: "",
      options: null,
      helpText: "User-defined template text. Multi-line text editor supports line breaks."
    });
    extensionRoot.register_preference(pref);
  }

  // Create shared namespace
  const Shared = {};

  // Export to global scope
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;

  if (typeof globalScope.__EXTENSION_SHARED__ === 'undefined') {
    globalScope.__EXTENSION_SHARED__ = {};
  }

  globalScope.__EXTENSION_SHARED__[extensionName] = {
    root: extensionRoot,
    shared: Shared
  };
})();
