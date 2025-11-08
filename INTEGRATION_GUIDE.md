# Antinote Framework Integration Guide

This document outlines the framework changes needed to support the extension architecture improvements, specifically for extension dependencies and inter-extension communication.

## Overview

The extensions system now supports:
1. **Extension Dependencies** - Extensions can depend on other extensions
2. **Service Extensions** - Extensions that provide APIs for other extensions
3. **Shared Preferences** - Multiple extensions can reference a single set of preferences
4. **Inter-Extension Communication** - Extensions can call functions exported by other extensions

## Required Framework Changes

### 1. Extension Metadata Schema Updates

#### New `extension.json` Fields

Add support for these new optional fields:

```json
{
  "dependencies": ["ai_providers"],  // Array of extension names this extension depends on
  "isService": true,                  // Boolean: true if this extension provides a service API
  "includedByDefault": true           // Boolean: true if should be enabled by default
}
```

**Schema Details:**

- **`dependencies`** (array of strings, optional)
  - Lists extension names that must be loaded before this extension
  - Framework should validate all dependencies are present
  - Framework should load extensions in dependency order
  - If a dependency is missing or disabled, show error to user

- **`isService`** (boolean, optional, default: false)
  - Indicates this extension provides APIs for other extensions
  - Service extensions may have zero commands (UI-less)
  - Service extensions should typically be `includedByDefault: true`

- **`includedByDefault`** (boolean, optional, default: false)
  - Whether extension should be enabled by default for new users
  - User can still disable it manually
  - Useful for service extensions that other extensions depend on

#### Security Disclosure Inheritance

**Important:** Extensions automatically inherit security disclosures (endpoints and API keys) from their dependencies.

**Implementation Rule:**
- When displaying security information to users, combine extension's own disclosures with inherited ones
- Recursive: if A depends on B, and B depends on C, then A inherits from both B and C
- Validation: Extension code must only use endpoints/API keys that are either directly declared OR inherited from dependencies

**Example:**

```json
// ai_providers/extension.json (service)
{
  "name": "ai_providers",
  "endpoints": [
    "https://api.openai.com/v1/chat/completions",
    "https://api.anthropic.com/v1/messages"
  ],
  "requiredAPIKeys": ["apikey_openai", "apikey_anthropic"]
}

// llm/extension.json (depends on ai_providers)
{
  "name": "llm",
  "dependencies": ["ai_providers"],
  "endpoints": [],              // Empty - inherits from ai_providers
  "requiredAPIKeys": []         // Empty - inherits from ai_providers
}
```

**UI Display Example:**
```
Extension: LLM
├─ Commands: ai(...)
├─ Network Access:
│  ├─ OpenAI API (inherited from ai_providers)
│  └─ Anthropic API (inherited from ai_providers)
└─ Required API Keys:
   ├─ apikey_openai (inherited from ai_providers)
   └─ apikey_anthropic (inherited from ai_providers)
```

**Why This Matters:**
- Users can see the full security footprint of an extension
- Prevents dependent extensions from hiding their network usage
- Makes it clear when installing an extension brings in additional dependencies
- Validation ensures extensions don't bypass declarations through dependencies

### 2. Extension Loading Order

**Current Behavior:** Extensions load in arbitrary order

**New Behavior:** Extensions must load in dependency order

**Implementation:**

```swift
func loadExtensions() {
    // 1. Parse all extension.json files to build dependency graph
    let extensionMetadata = parseAllExtensionMetadata()

    // 2. Perform topological sort to determine load order
    let loadOrder = topologicalSort(extensionMetadata)

    // 3. Detect circular dependencies
    if loadOrder == nil {
        // Show error: circular dependency detected
        return
    }

    // 4. Load extensions in dependency order
    for extensionName in loadOrder {
        loadExtension(extensionName)
    }
}
```

**Example Dependency Resolution:**

```
ai_providers (no dependencies) → Load first
    ↓
llm (depends on ai_providers) → Load second
    ↓
summarize (depends on ai_providers) → Load third (parallel with llm)
```

### 3. Global Function Registry

Extensions can now export functions globally for other extensions to use.

**JavaScript Context Setup:**

```swift
// When initializing the JavaScript context
func setupJavaScriptContext() {
    // Existing setup...

    // Add global registry for inter-extension communication
    context.evaluateScript("""
        // Global registry for extension-provided functions
        window.__extensionRegistry = {};

        // Helper to register a function from an extension
        window.registerExtensionFunction = function(name, fn) {
            window.__extensionRegistry[name] = fn;
            // Also expose directly on window for convenience
            window[name] = fn;
        };
    """)
}
```

**Example Usage in Extension:**

```javascript
// In ai_providers extension
(function() {
    // ... extension code ...

    // Export function globally
    window.callAIProvider = callAIProvider;

    // Or use the registry
    registerExtensionFunction('callAIProvider', callAIProvider);
})();
```

### 4. Dependency Validation

**On Extension Load:**

```swift
func loadExtension(_ metadata: ExtensionMetadata) throws {
    // Check dependencies before loading
    if let dependencies = metadata.dependencies {
        for depName in dependencies {
            guard loadedExtensions.contains(depName) else {
                throw ExtensionError.missingDependency(
                    extension: metadata.name,
                    dependency: depName
                )
            }
        }
    }

    // Load the extension...
}
```

**Error Handling:**

Show user-friendly errors:
- "Extension 'llm' requires 'ai_providers' to be installed and enabled"
- "Circular dependency detected: A → B → C → A"
- "Cannot disable 'ai_providers' because 'llm', 'summarize' depend on it"

### 5. Shared Preferences System

**Current Behavior:** Each extension has isolated preferences

**New Behavior:** Extensions can reference preferences from dependency extensions

**Implementation:**

```javascript
// getExtensionPreference should accept extension name parameter
// Extensions can read preferences from their dependencies

// In llm extension (depends on ai_providers)
var provider = getExtensionPreference("ai_providers", "provider");
var model = getExtensionPreference("ai_providers", "model");
```

**Swift Implementation:**

```swift
// Modify getExtensionPreference to accept extensionName parameter
func getExtensionPreference(extensionName: String, key: String) -> Any? {
    return preferences[extensionName]?[key]
}
```

### 6. Extension Disable/Enable Logic

**Before Disabling an Extension:**

```swift
func canDisableExtension(_ extensionName: String) -> (Bool, String?) {
    // Check if any enabled extensions depend on this one
    let dependents = loadedExtensions.filter { ext in
        ext.dependencies?.contains(extensionName) == true
    }

    if !dependents.isEmpty {
        let names = dependents.map { $0.name }.joined(separator: ", ")
        return (false, "Cannot disable '\(extensionName)' because these extensions depend on it: \(names)")
    }

    return (true, nil)
}
```

**When Disabling:**
- Warn user if other extensions depend on it
- Optionally: offer to disable dependent extensions too
- Or: prevent disabling entirely

### 7. UI Updates

#### Extensions Preferences UI

**Current:** Simple list of extensions with enable/disable toggles

**New:**
1. Show dependency information
   - "Depends on: ai_providers"
   - "Required by: llm, summarize, translate"

2. Visual indicators:
   - Badge for service extensions
   - Grayed out if dependencies are missing
   - Warning icon if dependency is disabled

3. Dependency chain view (optional):
   ```
   ┌─ ai_providers (Service) [Required by 3 extensions]
   ├─┬─ llm
   ├─┬─ summarize
   └─┬─ translate
   ```

#### Extension Installation Flow

When installing extension with dependencies:
1. Check if dependencies are installed
2. If missing: "This extension requires 'ai_providers'. Install it now?"
3. Install dependencies automatically (with user confirmation)

## Testing Checklist

### Dependency Loading
- [ ] Extensions load in correct dependency order
- [ ] Extension with dependencies loads after its dependencies
- [ ] Error shown if dependency is missing
- [ ] Error shown if circular dependency exists

### Function Registry
- [ ] Service extension can export functions globally
- [ ] Dependent extension can call exported functions
- [ ] Function calls work across extensions
- [ ] Proper error if function not available

### Shared Preferences
- [ ] Dependent extension can read dependency preferences
- [ ] Dependent extension cannot write to dependency preferences (optional restriction)
- [ ] Preference changes in dependency reflect in dependent

### Disable/Enable
- [ ] Cannot disable extension if others depend on it
- [ ] Warning shown with list of dependent extensions
- [ ] Disabling dependent extension allows disabling dependency

### UI
- [ ] Extension list shows dependency information
- [ ] Service extensions have visual indicator
- [ ] Install flow handles dependencies correctly

## Migration Path

### For Existing Installations

When updating to new framework version:

1. **Automatic Migration:**
   - All existing extensions work as before (backward compatible)
   - New `dependencies` field is optional
   - Service extensions (like ai_providers) auto-installed

2. **User Communication:**
   - "New: AI Providers service installed. Configure in Preferences > Extensions > AI Providers"
   - "Your existing extensions will now use shared AI configuration"

3. **Extension Updates:**
   - Old `llm` v2.0 → New `llm` v3.0 (depends on ai_providers)
   - Framework updates both atomically
   - Preferences migrate from llm → ai_providers

## Example: AI Providers Architecture

```
┌─────────────────────────────────┐
│     ai_providers (Service)      │
│  - No commands                  │
│  - Exports: callAIProvider()    │
│  - Manages: API keys, providers │
└─────────────┬───────────────────┘
              │
     ┌────────┴────────┬──────────────┬───────────────┐
     │                 │              │               │
┌────▼─────┐  ┌───────▼────┐  ┌─────▼──────┐  ┌────▼────────┐
│   llm    │  │ summarize  │  │ translate  │  │ grammarly   │
│ ai(...)  │  │ sum(...)   │  │ trans(...) │  │ grammar(...)│
└──────────┘  └────────────┘  └────────────┘  └─────────────┘

All depend on ai_providers
All use callAIProvider() function
All share same AI configuration
```

## Code Examples

### Example Service Extension (ai_providers)

```javascript
(function() {
    var extensionRoot = new Extension(/*...*/);

    function callAIProvider(prompt, options) {
        // Implementation...
        return new ReturnObject("success", "Response", text);
    }

    // Export globally
    window.callAIProvider = callAIProvider;
    window.AI_PROVIDERS = PROVIDERS;
})();
```

### Example Dependent Extension (llm)

```javascript
(function() {
    var extensionRoot = new Extension(/*...*/);

    var ai = new Command(/*...*/);

    ai.execute = function(payload) {
        // Check dependency available
        if (typeof callAIProvider === 'undefined') {
            return new ReturnObject("error", "AI Providers service not available");
        }

        // Use the service
        var result = callAIProvider(prompt, options);
        return result;
    };
})();
```

### Extension Metadata Examples

```json
// ai_providers/extension.json
{
  "name": "ai_providers",
  "version": "1.0.0",
  "isService": true,
  "includedByDefault": true,
  "commands": [],
  "dependencies": []
}
```

```json
// llm/extension.json
{
  "name": "llm",
  "version": "3.0.0",
  "dependencies": ["ai_providers"],
  "commands": [{"name": "ai", "description": "..."}]
}
```

## Future Enhancements

### Extension Marketplace
- Mark service extensions prominently
- Show dependency tree before install
- "X extensions use this service"

### Versioned Dependencies
```json
{
  "dependencies": {
    "ai_providers": "^1.0.0"  // Semver support
  }
}
```

### Extension SDK
- TypeScript definitions for framework APIs
- Helper functions for common patterns
- Testing utilities

## Questions for Framework Developer

1. **Preference Scope:** Should dependent extensions be able to write to dependency preferences, or only read?

2. **Circular Dependencies:** Hard error or allow with warning?

3. **Dependency Versions:** Start with unversioned dependencies or implement semver from the start?

4. **Service Discovery:** Should there be a registry API like `getService('ai_providers')` or just global functions?

5. **Extension Lifecycle:** Events when dependencies load/unload?

## Contact

For questions about this integration guide, contact the extension developer at the GitHub repository.
