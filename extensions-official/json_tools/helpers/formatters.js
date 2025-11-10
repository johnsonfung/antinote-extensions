// Formatting utilities for json_tools

(function() {
  const globalScope = (typeof global !== 'undefined') ? global :
                      (typeof window !== 'undefined') ? window : this;
  const ctx = globalScope.__EXTENSION_SHARED__["json_tools"];

  // Convert string to different casing styles
  const convertCasing = (str, casing) => {
    const words = str
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);

    switch (casing) {
      case 'snake_case':
        return words.map(w => w.toLowerCase()).join('_');
      case 'camelCase':
        return words.map((w, i) =>
          i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        ).join('');
      case 'PascalCase':
        return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
      case 'kebab-case':
        return words.map(w => w.toLowerCase()).join('-');
      case 'UPPER_CASE':
        return words.map(w => w.toUpperCase()).join('_');
      case 'lowercase':
        return words.map(w => w.toLowerCase()).join('');
      default:
        return str;
    }
  };

  // Convert keys of an object recursively
  const convertObjectKeys = (obj, casing) => {
    if (Array.isArray(obj)) {
      return obj.map(item => convertObjectKeys(item, casing));
    }

    if (obj !== null && typeof obj === 'object') {
      const result = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const newKey = convertCasing(key, casing);
          result[newKey] = convertObjectKeys(obj[key], casing);
        }
      }
      return result;
    }

    return obj;
  };

  // Get user's formatting preference
  const getFormatPreference = () => {
    return getExtensionPreference("json_tools", "format_style") || "pretty";
  };

  // Export to shared namespace
  ctx.shared.Formatters = {
    convertCasing,
    convertObjectKeys,
    getFormatPreference
  };
})();
