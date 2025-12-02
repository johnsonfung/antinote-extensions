// ===============================
// Antinote Extension: regex
// Version 1.0.0
// Multi-file structure
// ===============================

(function () {
  const extensionName = "regex";

  const extensionRoot = new Extension({
    name: extensionName,
    version: "1.0.1",
    endpoints: [],
    requiredAPIKeys: [],
    author: "johnsonfung",
    category: "Text Manipulation",
    dataScope: "full"
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
