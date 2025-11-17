// ===============================
// Antinote Extension: clean_line
// Version 1.0.0
// Multi-file structure
// ===============================

(function () {
  const extensionName = "clean_line";

  const extensionRoot = new Extension({
    name: extensionName,
    version: "1.0.0",
    endpoints: [],
    requiredAPIKeys: [],
    author: "johnsonfung",
    category: "Text Formatting",
    dataScope: "line"
  });

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
