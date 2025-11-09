#!/usr/bin/env node

/**
 * Build Script for Antinote Extensions
 *
 * This script:
 * 1. Updates all extension.json files with official/includedByDefault fields
 * 2. Validates that official extensions are in official folder
 * 3. Creates zip files for each extension
 * 4. Generates manifest.json with SHA-256 hashes
 * 5. Signs the manifest (placeholder for now)
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const archiver = require('archiver');
const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const EXTENSIONS_OFFICIAL_DIR = path.join(ROOT_DIR, 'extensions-official');
const EXTENSIONS_UNOFFICIAL_DIR = path.join(ROOT_DIR, 'extensions-unofficial');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DIST_EXTENSIONS_DIR = path.join(DIST_DIR, 'extensions');
const VERSION_FILE = path.join(ROOT_DIR, 'manifest-version.json');

// Extensions that should be included by default
const INCLUDED_BY_DEFAULT = ['random', 'date', 'text_format', 'line_format'];

// Parse command line arguments
const args = process.argv.slice(2);
const versionBump = args.find(arg => ['major', 'minor', 'patch'].includes(arg)) || 'patch';

// Utility: Calculate SHA-256 hash of a file
function calculateSHA256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

// Utility: Calculate SHA-256 hash of a string
function calculateSHA256String(content) {
  const hashSum = crypto.createHash('sha256');
  hashSum.update(content);
  return hashSum.digest('hex');
}

// Utility: Get all extension directories
function getExtensionDirs(baseDir) {
  if (!fs.existsSync(baseDir)) {
    return [];
  }

  return fs.readdirSync(baseDir)
    .filter(name => {
      const fullPath = path.join(baseDir, name);
      return fs.statSync(fullPath).isDirectory();
    })
    .map(name => ({
      name,
      path: path.join(baseDir, name),
      metadataPath: path.join(baseDir, name, 'extension.json')
    }));
}

// Utility: Read and increment version
function readAndIncrementVersion() {
  let versionData;

  if (fs.existsSync(VERSION_FILE)) {
    versionData = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
  } else {
    // Initialize version file if it doesn't exist
    versionData = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      buildNumber: 0
    };
  }

  // Parse semantic version
  const [major, minor, patch] = versionData.version.split('.').map(Number);

  // Increment based on argument
  let newVersion;
  switch (versionBump) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
    default:
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }

  // Update version data
  versionData.version = newVersion;
  versionData.lastUpdated = new Date().toISOString();
  versionData.buildNumber += 1;

  // Save updated version
  fs.writeFileSync(VERSION_FILE, JSON.stringify(versionData, null, 2) + '\n');

  return versionData;
}

// Step 1: Update extension.json files
function updateExtensionMetadata() {
  console.log('📝 Updating extension metadata...');

  // Update official extensions
  const officialDirs = getExtensionDirs(EXTENSIONS_OFFICIAL_DIR);
  officialDirs.forEach(({ name, metadataPath }) => {
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

      // Add official and includedByDefault fields
      metadata.official = true;
      metadata.includedByDefault = INCLUDED_BY_DEFAULT.includes(name);

      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n');
      console.log(`  ✓ Updated ${name} (includedByDefault: ${metadata.includedByDefault})`);
    }
  });

  // Update unofficial extensions
  const unofficialDirs = getExtensionDirs(EXTENSIONS_UNOFFICIAL_DIR);
  unofficialDirs.forEach(({ name, metadataPath }) => {
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

      // Add official field (unofficial extensions don't have includedByDefault)
      metadata.official = false;

      // Remove includedByDefault if it exists
      if ('includedByDefault' in metadata) {
        delete metadata.includedByDefault;
      }

      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n');
      console.log(`  ✓ Updated ${name} (unofficial)`);
    }
  });
}

// Step 2: Validate folder structure
function validateFolderStructure() {
  console.log('\n🔍 Validating folder structure...');

  let errors = [];

  // Check official extensions
  const officialDirs = getExtensionDirs(EXTENSIONS_OFFICIAL_DIR);
  officialDirs.forEach(({ name, metadataPath }) => {
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      if (metadata.official !== true) {
        errors.push(`ERROR: ${name} in extensions-official but has official=${metadata.official}`);
      }
    }
  });

  // Check unofficial extensions
  const unofficialDirs = getExtensionDirs(EXTENSIONS_UNOFFICIAL_DIR);
  unofficialDirs.forEach(({ name, metadataPath }) => {
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      if (metadata.official !== false) {
        errors.push(`ERROR: ${name} in extensions-unofficial but has official=${metadata.official}`);
      }
      if ('includedByDefault' in metadata) {
        errors.push(`ERROR: ${name} is unofficial but has includedByDefault field`);
      }
    }
  });

  if (errors.length > 0) {
    console.error('\n❌ Validation errors:');
    errors.forEach(err => console.error(`  ${err}`));
    process.exit(1);
  }

  console.log('  ✓ All extensions are in correct folders');
}

// Step 3: Create distribution directory
function setupDistDirectory() {
  console.log('\n📁 Setting up distribution directory...');

  // Clean and recreate dist directory
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.mkdirSync(DIST_EXTENSIONS_DIR, { recursive: true });

  console.log(`  ✓ Created ${DIST_DIR}`);
}

// Step 4: Create zip files for each extension
async function createZipFiles() {
  console.log('\n📦 Creating extension zip files...');

  const allExtensions = [
    ...getExtensionDirs(EXTENSIONS_OFFICIAL_DIR),
    ...getExtensionDirs(EXTENSIONS_UNOFFICIAL_DIR)
  ];

  const zipInfo = [];

  for (const { name, path: extPath, metadataPath } of allExtensions) {
    const zipPath = path.join(DIST_EXTENSIONS_DIR, `${name}.zip`);

    try {
      // Create zip using archiver
      await new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', resolve);
        archive.on('error', reject);

        archive.pipe(output);
        archive.directory(extPath, name);
        archive.finalize();
      });

      const sha256 = calculateSHA256(zipPath);
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      const metadataSha256 = calculateSHA256String(JSON.stringify(metadata));

      zipInfo.push({
        name,
        zipPath,
        sha256,
        metadataSha256,
        metadata
      });

      console.log(`  ✓ Created ${name}.zip (SHA256: ${sha256.substring(0, 16)}...)`);
    } catch (error) {
      console.error(`  ✗ Failed to create ${name}.zip:`, error.message);
      process.exit(1);
    }
  }

  return zipInfo;
}

// Step 5: Generate manifest.json
function generateManifest(zipInfo, versionData) {
  console.log('\n📄 Generating manifest.json...');

  const manifest = {
    version: versionData.version,
    buildNumber: versionData.buildNumber,
    generatedAt: new Date().toISOString(),
    extensions: zipInfo.map(({ name, sha256, metadataSha256, metadata }) => ({
      id: name,
      name: metadata.name,
      version: metadata.version,
      author: metadata.author,
      description: metadata.description,
      license: metadata.license,
      category: metadata.category,
      dataScope: metadata.dataScope,
      official: metadata.official,
      includedByDefault: metadata.includedByDefault || false,
      endpoints: metadata.endpoints,
      requiredAPIKeys: metadata.requiredAPIKeys,
      commands: metadata.commands,
      sha256: sha256,
      metadataSha256: metadataSha256,
      downloadUrl: `extensions/${name}.zip`
    }))
  };

  const manifestPath = path.join(DIST_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  console.log(`  ✓ Generated manifest.json with ${manifest.extensions.length} extensions`);

  return manifest;
}

// Step 6: Sign manifest with Ed25519
function signManifest(manifest) {
  console.log('\n🔐 Signing manifest...');

  // Get private key from environment variable
  const privateKeyHex = process.env.MANIFEST_PRIVATE_KEY;

  if (!privateKeyHex) {
    console.warn('  ⚠️  Warning: MANIFEST_PRIVATE_KEY not set in environment');
    console.warn('  ⚠️  Using fallback SHA-256 hash instead of cryptographic signature');

    // Fallback to hash-based signature
    const manifestContent = JSON.stringify(manifest);
    const signature = calculateSHA256String(manifestContent);
    manifest.signature = signature;
    manifest.signatureType = 'sha256-fallback';
  } else {
    try {
      // Convert hex private key to Uint8Array
      const privateKeyBytes = naclUtil.decodeBase64(Buffer.from(privateKeyHex, 'hex').toString('base64'));

      // Validate key length (Ed25519 secret keys are 64 bytes, or 32 bytes for seed)
      if (privateKeyBytes.length !== 64 && privateKeyBytes.length !== 32) {
        throw new Error(`Invalid private key length: ${privateKeyBytes.length} bytes (expected 32 or 64)`);
      }

      // If 32 bytes (seed), generate full keypair
      let secretKey = privateKeyBytes;
      if (privateKeyBytes.length === 32) {
        const keyPair = nacl.sign.keyPair.fromSeed(privateKeyBytes);
        secretKey = keyPair.secretKey;

        // Extract and save public key for verification
        const publicKeyHex = Buffer.from(keyPair.publicKey).toString('hex');
        manifest.publicKey = publicKeyHex;
      }

      // Create canonical JSON string (sorted keys, no whitespace) for signing
      const manifestForSigning = { ...manifest };
      delete manifestForSigning.signature;
      delete manifestForSigning.signatureType;
      const manifestContent = JSON.stringify(manifestForSigning, Object.keys(manifestForSigning).sort());

      // Sign using Ed25519
      const messageBytes = naclUtil.decodeUTF8(manifestContent);
      const signatureBytes = nacl.sign.detached(messageBytes, secretKey);
      const signatureBase64 = naclUtil.encodeBase64(signatureBytes);

      manifest.signature = signatureBase64;
      manifest.signatureType = 'ed25519';

      console.log(`  ✓ Signed manifest with Ed25519`);
      console.log(`    Signature: ${signatureBase64.substring(0, 32)}...`);
      if (manifest.publicKey) {
        console.log(`    Public key: ${manifest.publicKey.substring(0, 32)}...`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to sign manifest: ${error.message}`);
      console.warn('  ⚠️  Using fallback SHA-256 hash instead');

      // Fallback to hash-based signature
      const manifestContent = JSON.stringify(manifest);
      const signature = calculateSHA256String(manifestContent);
      manifest.signature = signature;
      manifest.signatureType = 'sha256-fallback';
    }
  }

  const manifestPath = path.join(DIST_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  console.log(`  ✓ Manifest signed and saved`);
}

// Step 7: Generate checksums file
function generateChecksums(zipInfo) {
  console.log('\n📋 Generating checksums.txt...');

  const lines = zipInfo.map(({ name, sha256 }) => `${sha256}  extensions/${name}.zip`);
  const checksumsPath = path.join(DIST_DIR, 'checksums.txt');
  fs.writeFileSync(checksumsPath, lines.join('\n') + '\n');

  console.log(`  ✓ Generated checksums.txt`);
}

// Step 0: Auto-bump versions for changed extensions
function autoBumpChangedExtensions() {
  console.log('\n🔄 Auto-bumping versions for changed extensions...');

  try {
    const { execSync } = require('child_process');
    const bumpScript = path.join(__dirname, 'bump-changed-extensions.js');
    execSync(`node "${bumpScript}"`, { stdio: 'inherit', cwd: ROOT_DIR });
    console.log('  ✓ Version bumping completed');
  } catch (error) {
    console.error('  ✗ Failed to auto-bump versions:', error.message);
    // Don't fail the build if version bumping fails
  }
}

// Main build process
async function main() {
  console.log('🚀 Starting Antinote Extensions Build Process\n');
  console.log('='.repeat(50));

  try {
    // Auto-bump versions for changed extensions
    autoBumpChangedExtensions();

    // Increment version
    console.log(`\n📌 Incrementing version (${versionBump})...`);
    const versionData = readAndIncrementVersion();
    console.log(`  ✓ New version: ${versionData.version} (build ${versionData.buildNumber})`);

    updateExtensionMetadata();
    validateFolderStructure();
    setupDistDirectory();
    const zipInfo = await createZipFiles();
    const manifest = generateManifest(zipInfo, versionData);
    signManifest(manifest);
    generateChecksums(zipInfo);

    console.log('\n' + '='.repeat(50));
    console.log('✅ Build completed successfully!');
    console.log(`\nManifest Version: ${versionData.version} (build ${versionData.buildNumber})`);
    console.log(`Output directory: ${DIST_DIR}`);
    console.log(`  - manifest.json (with ${manifest.extensions.length} extensions)`);
    console.log(`  - checksums.txt`);
    console.log(`  - extensions/ (${zipInfo.length} zip files)`);

    // Summary
    const official = zipInfo.filter(z => z.metadata.official).length;
    const unofficial = zipInfo.filter(z => !z.metadata.official).length;
    const includedByDefault = zipInfo.filter(z => z.metadata.includedByDefault).length;

    console.log(`\n📊 Summary:`);
    console.log(`  - Manifest version: ${versionData.version}`);
    console.log(`  - Build number: ${versionData.buildNumber}`);
    console.log(`  - Official extensions: ${official}`);
    console.log(`  - Unofficial extensions: ${unofficial}`);
    console.log(`  - Included by default: ${includedByDefault}`);

  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the build
main();
