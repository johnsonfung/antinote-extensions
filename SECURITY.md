# Security & Manifest Signing

This document explains how the manifest signing system works and how to set up the cryptographic keys.

## Overview

The build system signs the `manifest.json` file using **Ed25519** digital signatures to ensure:
- **Authenticity**: The manifest came from the official source
- **Integrity**: The manifest hasn't been tampered with
- **Trust**: Your Swift app can verify the manifest before trusting it

## Key Generation (One-Time Setup)

### 1. Generate Ed25519 Keypair

You need to generate a keypair **once**. Use one of these methods:

#### Option A: Using Node.js (Recommended)

```javascript
// generate-keys.js
const nacl = require('tweetnacl');

const keyPair = nacl.sign.keyPair();

console.log('Private Key (hex):', Buffer.from(keyPair.secretKey).toString('hex').substring(0, 64));
console.log('Public Key (hex):', Buffer.from(keyPair.publicKey).toString('hex'));
console.log('\nStore the private key in your environment variables.');
console.log('Embed the public key in your Swift app for verification.');
```

Run:
```bash
npm install tweetnacl
node generate-keys.js
```

#### Option B: Using OpenSSL

```bash
# Generate private key (32 bytes seed)
openssl rand -hex 32

# This will be your MANIFEST_PRIVATE_KEY
```

The public key will be automatically derived and included in the manifest during build.

### 2. Store Private Key Securely

**IMPORTANT**: The private key must be kept secret!

#### For Local Development:
```bash
# Add to your shell profile (~/.zshrc, ~/.bashrc, etc.)
export MANIFEST_PRIVATE_KEY="your_private_key_hex_here"

# Or use a .env file (add .env to .gitignore!)
echo "MANIFEST_PRIVATE_KEY=your_private_key_hex_here" > .env
```

#### For CI/CD (GitHub Actions):
1. Go to Repository Settings → Secrets and variables → Actions
2. Add secret: `MANIFEST_PRIVATE_KEY`
3. Paste your private key hex string

#### For Production Server:
- Use environment variables
- Use a secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)
- **Never commit the private key to git**

### 3. Embed Public Key in Swift App

The public key is safe to embed directly in your Swift app:

```swift
// In your Swift app
let manifestPublicKeyHex = "your_public_key_hex_here"

func verifyManifest(_ manifest: Manifest) -> Bool {
    guard let publicKeyData = Data(hex: manifest.publicKey ?? manifestPublicKeyHex) else {
        return false
    }

    // Verify Ed25519 signature
    // Use CryptoKit or a Swift Ed25519 library
    // ...
}
```

## How Signing Works

### Build Process:

1. **Build runs**: `npm run build`
2. **Check for key**: Looks for `MANIFEST_PRIVATE_KEY` environment variable
3. **Sign manifest**:
   - If key exists: Signs with Ed25519
   - If key missing: Uses SHA-256 hash fallback (warns in output)
4. **Include metadata**:
   - `signature`: Base64-encoded Ed25519 signature
   - `signatureType`: "ed25519" or "sha256-fallback"
   - `publicKey`: Hex-encoded public key (for verification)

### Verification in Swift:

```swift
// 1. Fetch manifest.json
// 2. Check signatureType
if manifest.signatureType == "ed25519" {
    // 3. Extract signature and publicKey
    // 4. Create canonical JSON (same format as build script)
    // 5. Verify signature using Ed25519
    // 6. Only trust manifest if signature is valid
} else {
    // Handle fallback or reject unsigned manifests
}
```

## Manifest Format

The signed manifest includes:

```json
{
  "version": "1.0.0",
  "buildNumber": 1,
  "generatedAt": "2025-11-08T...",
  "publicKey": "abc123...",
  "signature": "xyz789...",
  "signatureType": "ed25519",
  "extensions": [...]
}
```

## Security Best Practices

### DO:
✅ Keep private key in environment variables
✅ Use different keys for development and production
✅ Rotate keys periodically
✅ Verify signatures before trusting manifests
✅ Use HTTPS for manifest downloads

### DON'T:
❌ Commit private keys to git
❌ Share private keys
❌ Use the same key across multiple projects
❌ Store private keys in plaintext files
❌ Skip signature verification in production

## Fallback Mode (Development Only)

If `MANIFEST_PRIVATE_KEY` is not set, the build uses SHA-256 hash as a fallback:

```
⚠️  Warning: MANIFEST_PRIVATE_KEY not set in environment
⚠️  Using fallback SHA-256 hash instead of cryptographic signature
```

This is **acceptable for development** but should **never be used in production**.

Your Swift app should:
- **Reject** manifests with `signatureType: "sha256-fallback"` in production
- **Accept** them only in debug builds for development

## Signature Verification Algorithm

The build signs a **canonical JSON representation** of the manifest:

```javascript
// 1. Remove signature fields
const manifestForSigning = { ...manifest };
delete manifestForSigning.signature;
delete manifestForSigning.signatureType;

// 2. Create canonical JSON (sorted keys, no whitespace)
const canonicalJSON = JSON.stringify(
  manifestForSigning,
  Object.keys(manifestForSigning).sort()
);

// 3. Sign with Ed25519
const signature = nacl.sign.detached(
  utf8ToBytes(canonicalJSON),
  secretKey
);
```

Your Swift app must recreate this **exact same canonical JSON** to verify the signature.

## Key Rotation

If you need to rotate keys:

1. Generate new keypair
2. Update `MANIFEST_PRIVATE_KEY` environment variable
3. Rebuild manifest with new signature
4. Update Swift app with new public key
5. Deploy updated app
6. Securely delete old private key

## Questions?

- **Q: What if the private key is compromised?**
  A: Immediately rotate to a new keypair and release an app update with the new public key.

- **Q: Can I use the same key for multiple projects?**
  A: No, use a unique keypair for each project.

- **Q: How do I verify signatures in Swift?**
  A: Use CryptoKit (iOS 13+) or a Swift Ed25519 library like swift-crypto.

- **Q: What happens if I lose the private key?**
  A: Generate a new keypair and update your Swift app. Old manifests will become unverifiable.
