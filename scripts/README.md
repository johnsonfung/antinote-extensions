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
# Build with automatic patch version increment (default)
npm run build
# or
npm run build:patch

# Build with minor version increment
npm run build:minor

# Build with major version increment
npm run build:major

# Or directly with version argument
node scripts/build.js [patch|minor|major]
```

### Versioning:

The manifest version is automatically incremented with each build and tracked in `manifest-version.json`:

- **patch** (default): `1.0.0` → `1.0.1` - For bug fixes and minor changes
- **minor**: `1.0.0` → `1.1.0` - For new extensions or features
- **major**: `1.0.0` → `2.0.0` - For breaking changes

The version file tracks:
- **version**: Semantic version string (e.g., "1.2.3")
- **buildNumber**: Auto-incrementing build counter
- **lastUpdated**: ISO timestamp of last build

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
  "buildNumber": 1,
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

The build script signs the manifest using **Ed25519 cryptographic signatures**.

**Setup Required:**
1. Set `MANIFEST_PRIVATE_KEY` environment variable with your Ed25519 private key (hex format)
2. The build script will automatically sign the manifest and include the public key
3. Embed the public key in your Swift app to verify signatures

**See [SECURITY.md](../SECURITY.md) for complete setup instructions.**

If `MANIFEST_PRIVATE_KEY` is not set:
- Build will warn and use SHA-256 hash fallback
- Manifest will have `signatureType: "sha256-fallback"`
- **Not suitable for production** - your Swift app should reject these

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
