const extensionName = "business";

// Create extension root
const extensionRoot = new Extension({
  name: extensionName,
  version: "1.0.2",
  endpoints: [],
  requiredAPIKeys: [],
  author: "johnsonfung",
  category: "Business & Analytics",
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
