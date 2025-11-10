# Swift Integration Guide: Multi-File Extension Support

This guide explains how to update your Swift application to support multi-file extensions.

---

## Overview

Extensions can now consist of multiple JavaScript files instead of just `index.js`. The files are declared in `extension.json` and loaded sequentially in order.

### Key Changes:
1. Extensions can have a `files` array in `extension.json`
2. If `files` exists, load all files in order and concatenate
3. If `files` doesn't exist, fall back to loading `index.js` (backward compatible)
4. Size information is now included in `extension.json` for UI display

---

## Extension Metadata Schema

### Single-File Extension (Backward Compatible):
```json
{
  "name": "dice",
  "version": "1.0.0",
  ...
  "size": {
    "total": 2867,
    "totalKB": 2.8
  }
}
```
*No `files` field = load `index.js` only*

### Multi-File Extension (New):
```json
{
  "name": "json_tools",
  "version": "2.0.0",
  ...
  "files": [
    "index.js",
    "helpers/smart-extractor.js",
    "helpers/formatters.js",
    "commands/csv.js",
    "commands/sort.js"
  ],
  "size": {
    "total": 36005,
    "totalKB": 35.2
  }
}
```
*With `files` field = load all files in order*

---

## Implementation

### Current Loading (Single-File):

```swift
func loadExtension(at extensionPath: URL) throws -> Extension {
    // 1. Load metadata
    let metadataURL = extensionPath.appendingPathComponent("extension.json")
    let metadataData = try Data(contentsOf: metadataURL)
    let metadata = try JSONDecoder().decode(ExtensionMetadata.self, from: metadataData)

    // 2. Load index.js
    let indexURL = extensionPath.appendingPathComponent("index.js")
    let source = try String(contentsOf: indexURL, encoding: .utf8)

    // 3. Execute in JSContext
    jsContext.evaluateScript(source)

    return Extension(metadata: metadata)
}
```

### Updated Loading (Multi-File Support):

```swift
func loadExtension(at extensionPath: URL) throws -> Extension {
    // 1. Load metadata
    let metadataURL = extensionPath.appendingPathComponent("extension.json")
    let metadataData = try Data(contentsOf: metadataURL)
    let metadata = try JSONDecoder().decode(ExtensionMetadata.self, from: metadataData)

    // 2. Load source code
    var concatenatedSource = ""

    if let files = metadata.files, !files.isEmpty {
        // Multi-file extension - load all files in order
        for file in files {
            let fileURL = extensionPath.appendingPathComponent(file)

            guard FileManager.default.fileExists(atPath: fileURL.path) else {
                throw ExtensionError.fileNotFound(path: file)
            }

            let fileSource = try String(contentsOf: fileURL, encoding: .utf8)
            concatenatedSource += fileSource + "\n"
        }
    } else {
        // Single-file extension (backward compatible)
        let indexURL = extensionPath.appendingPathComponent("index.js")
        concatenatedSource = try String(contentsOf: indexURL, encoding: .utf8)
    }

    // 3. Execute concatenated source in JSContext
    jsContext.evaluateScript(concatenatedSource)

    return Extension(metadata: metadata)
}
```

---

## Updated Metadata Model

Add the `files` and `size` fields to your metadata model:

```swift
struct ExtensionMetadata: Codable {
    let name: String
    let version: String
    let author: String
    let description: String
    let license: String
    let category: String
    let dataScope: String
    let endpoints: [String]
    let requiredAPIKeys: [String]
    let commands: [CommandMetadata]
    let official: Bool
    let dependencies: [String]?
    let isService: Bool?
    let includedByDefault: Bool?

    // NEW: Multi-file support
    let files: [String]?

    // NEW: Size information
    let size: ExtensionSize?
}

struct ExtensionSize: Codable {
    let total: Int        // Total bytes
    let totalKB: Double   // KB for display
}
```

---

## Error Handling

Add these error cases:

```swift
enum ExtensionError: Error {
    case metadataNotFound
    case invalidMetadata
    case fileNotFound(path: String)
    case emptyFilesArray
    case loadingFailed(reason: String)

    var localizedDescription: String {
        switch self {
        case .fileNotFound(let path):
            return "Extension file not found: \(path)"
        case .emptyFilesArray:
            return "Extension files array cannot be empty"
        case .loadingFailed(let reason):
            return "Failed to load extension: \(reason)"
        default:
            return "Extension error"
        }
    }
}
```

---

## UI Display

### Extensions List:

Display size information from metadata:

```swift
struct ExtensionRow: View {
    let extension: Extension

    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(extension.metadata.name)
                    .font(.headline)
                Text(extension.metadata.description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            // Display size
            if let size = extension.metadata.size {
                Text("\(size.totalKB, specifier: "%.1f") KB")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}
```

### Extension Details (Optional):

For multi-file extensions, you could show file breakdown:

```swift
if let files = extension.metadata.files, files.count > 1 {
    Section("Files") {
        ForEach(files, id: \.self) { file in
            Text(file)
                .font(.system(.body, design: .monospaced))
        }
    }
}
```

---

## Validation

Add validation when loading extensions:

```swift
func validateExtension(metadata: ExtensionMetadata, at path: URL) throws {
    if let files = metadata.files {
        // Validate files array
        guard !files.isEmpty else {
            throw ExtensionError.emptyFilesArray
        }

        // Validate index.js is first
        guard files[0] == "index.js" else {
            throw ExtensionError.loadingFailed(reason: "index.js must be the first file")
        }

        // Validate all files exist
        for file in files {
            let fileURL = path.appendingPathComponent(file)
            guard FileManager.default.fileExists(atPath: fileURL.path) else {
                throw ExtensionError.fileNotFound(path: file)
            }
        }
    } else {
        // Single-file: validate index.js exists
        let indexURL = path.appendingPathComponent("index.js")
        guard FileManager.default.fileExists(atPath: indexURL.path) else {
            throw ExtensionError.fileNotFound(path: "index.js")
        }
    }
}
```

---

## Testing

### Test Single-File Extension (Backward Compatibility):

```swift
func testSingleFileExtension() throws {
    // Extension without "files" field should load index.js
    let extension = try loadExtension(at: diceExtensionURL)
    XCTAssertEqual(extension.metadata.name, "dice")
    XCTAssertNil(extension.metadata.files)
}
```

### Test Multi-File Extension:

```swift
func testMultiFileExtension() throws {
    // Extension with "files" field should load all files
    let extension = try loadExtension(at: jsonToolsExtensionURL)
    XCTAssertEqual(extension.metadata.name, "json_tools")
    XCTAssertNotNil(extension.metadata.files)
    XCTAssertGreaterThan(extension.metadata.files?.count ?? 0, 1)
}
```

### Test File Order:

```swift
func testFileOrderMatters() throws {
    // Files should be loaded in order
    // If helpers are loaded before commands, commands can use helpers
    let extension = try loadExtension(at: jsonToolsExtensionURL)

    // Execute a command that depends on helpers
    let result = extension.execute(command: "csv_to_json", with: testPayload)
    XCTAssertEqual(result.status, "success")
}
```

---

## Migration Checklist

- [ ] Update `ExtensionMetadata` model to include `files` and `size` fields
- [ ] Update extension loading to support multi-file extensions
- [ ] Add validation for files array
- [ ] Add error handling for missing files
- [ ] Update UI to display extension sizes
- [ ] Test backward compatibility with existing single-file extensions
- [ ] Test new multi-file extensions
- [ ] Update any extension bundling/distribution code

---

## Example Complete Implementation

```swift
class ExtensionLoader {
    private let jsContext: JSContext

    func loadExtension(at extensionPath: URL) throws -> Extension {
        // 1. Load and parse metadata
        let metadataURL = extensionPath.appendingPathComponent("extension.json")
        guard FileManager.default.fileExists(atPath: metadataURL.path) else {
            throw ExtensionError.metadataNotFound
        }

        let metadataData = try Data(contentsOf: metadataURL)
        let metadata = try JSONDecoder().decode(ExtensionMetadata.self, from: metadataData)

        // 2. Validate extension structure
        try validateExtension(metadata: metadata, at: extensionPath)

        // 3. Load source code
        let source = try loadExtensionSource(metadata: metadata, at: extensionPath)

        // 4. Execute in JSContext
        guard jsContext.evaluateScript(source) != nil else {
            throw ExtensionError.loadingFailed(reason: "Failed to execute extension code")
        }

        // 5. Create Extension object
        return Extension(
            metadata: metadata,
            path: extensionPath,
            jsContext: jsContext
        )
    }

    private func loadExtensionSource(metadata: ExtensionMetadata, at path: URL) throws -> String {
        var concatenatedSource = ""

        if let files = metadata.files, !files.isEmpty {
            // Multi-file extension
            for file in files {
                let fileURL = path.appendingPathComponent(file)
                let fileSource = try String(contentsOf: fileURL, encoding: .utf8)
                concatenatedSource += fileSource + "\n"
            }
        } else {
            // Single-file extension (backward compatible)
            let indexURL = path.appendingPathComponent("index.js")
            concatenatedSource = try String(contentsOf: indexURL, encoding: .utf8)
        }

        return concatenatedSource
    }

    private func validateExtension(metadata: ExtensionMetadata, at path: URL) throws {
        if let files = metadata.files {
            guard !files.isEmpty else {
                throw ExtensionError.emptyFilesArray
            }

            guard files[0] == "index.js" else {
                throw ExtensionError.loadingFailed(reason: "index.js must be first")
            }

            for file in files {
                let fileURL = path.appendingPathComponent(file)
                guard FileManager.default.fileExists(atPath: fileURL.path) else {
                    throw ExtensionError.fileNotFound(path: file)
                }
            }
        } else {
            let indexURL = path.appendingPathComponent("index.js")
            guard FileManager.default.fileExists(atPath: indexURL.path) else {
                throw ExtensionError.fileNotFound(path: "index.js")
            }
        }
    }
}
```

---

## Questions?

If you encounter any issues:
1. Check that `files` array exists and is not empty
2. Verify `index.js` is the first file
3. Ensure all declared files exist in the extension folder
4. Check file paths are relative to extension root (not absolute)
5. Verify file concatenation preserves line breaks between files

The sequential loading approach is simple and robust - files are just concatenated with newlines between them and executed as one script.
