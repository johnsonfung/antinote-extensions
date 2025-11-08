# Build Scripts

This directory contains build scripts for the Antinote Extensions repository.

## build.js

The main build script that generates a distributable manifest and extension packages.

### What it does:

1. **Updates Extension Metadata** - Adds `official` and `includedByDefault` fields to all extension.json files
2. **Validates Folder Structure** - Ensures official extensions are in `extensions-official/` and unofficial in `extensions-unofficial/`
3. **Creates ZIP Files** - Packages each extension into a `.zip` file
4. **Generates Manifest** - Creates `manifest.json` with:
   - Complete extension metadata
   - SHA-256 hashes for integrity verification
   - Download URLs for each extension
   - Digital signature (placeholder)
5. **Creates Checksums** - Generates `checksums.txt` for manual verification

### Usage:

```bash
# Using npm script (recommended)
npm run build

# Or directly
node scripts/build.js
```

### Output Structure:

```
dist/
├── manifest.json          # Main manifest with all extensions and signatures
├── checksums.txt          # SHA-256 checksums for all zip files
└── extensions/
    ├── date.zip
    ├── dice.zip
    ├── line_format.zip
    ├── openai.zip
    ├── random.zip
    ├── text_format.zip
    └── rule_of_three.zip
```

### Manifest Schema:

```json
{
  "version": "1.0.0",
  "generatedAt": "ISO8601 timestamp",
  "signature": "SHA-256 hash of manifest (placeholder for real signature)",
  "extensions": [
    {
      "id": "extension_name",
      "name": "extension_name",
      "version": "1.0.0",
      "author": "author_name",
      "description": "Extension description",
      "license": "MIT",
      "category": "Category Name",
      "dataScope": "none|line|full",
      "official": true|false,
      "includedByDefault": true|false,
      "endpoints": ["https://api.example.com"],
      "requiredAPIKeys": ["API_KEY_NAME"],
      "commands": [...],
      "sha256": "hash_of_zip_file",
      "metadataSha256": "hash_of_extension_json",
      "downloadUrl": "extensions/extension_name.zip"
    }
  ]
}
```

### Extension Metadata Fields:

- **official**: `true` for official extensions, `false` for community extensions
- **includedByDefault**: `true` if the extension should be installed by default (only for official extensions)
  - Currently included by default: `date`, `random`, `text_format`, `line_format`
- **sha256**: SHA-256 hash of the extension zip file for integrity verification
- **metadataSha256**: SHA-256 hash of the extension.json file
- **downloadUrl**: Relative path to download the extension zip

### Security:

The build script currently generates a placeholder signature by hashing the manifest content.

**TODO**: Implement proper cryptographic signing with a private key:
1. Generate a private/public key pair
2. Sign the manifest with the private key
3. Distribute the public key with the Swift app
4. Verify the signature in the Swift app before trusting the manifest

### Requirements:

- Node.js (v14 or higher)
- `archiver` package (installed via `npm install`)

### Configuration:

Edit the `INCLUDED_BY_DEFAULT` array in `build.js` to change which extensions are included by default:

```javascript
const INCLUDED_BY_DEFAULT = ['random', 'date', 'text_format', 'line_format'];
```

### Validation:

The build script validates:
- ✅ All official extensions have `official: true` and are in `extensions-official/`
- ✅ All unofficial extensions have `official: false` and are in `extensions-unofficial/`
- ✅ Unofficial extensions don't have `includedByDefault` field
- ✅ All required metadata fields are present

Build will fail if validation errors are detected.
