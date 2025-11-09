# GitHub Actions Workflows

This directory contains the CI/CD workflows for the Antinote Extensions repository.

## Workflows

### CI - Test, Build and Release (`ci.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**What it does:**

#### 1. Test Job (runs on all triggers)
- Runs script tests (`npm run test:scripts`)
  - Tests for `bump-changed-extensions.js`
  - Tests for `validate.js`
- Validates extension metadata (`npm run validate`)
- Runs extension unit tests (`npm run test:extensions`)

#### 2. Build and Release Job (only on push to main)
- Only runs if all tests pass
- Only runs on direct pushes to `main` (not on PRs)
- Automatically bumps version (patch by default)
- Auto-bumps individual extension versions if files changed
- Builds all extensions with cryptographic signing
- Creates a GitHub Release with:
  - `manifest.json` - Signed manifest with metadata and checksums
  - `checksums.txt` - SHA-256 checksums for verification
  - Individual `.zip` files for each extension
- Commits the version bump back to the repository

**Key Features:**
- Automatic releases on every merge to main
- No manual intervention needed
- Ensures all tests pass before releasing
- Cryptographically signs the manifest
- Version auto-incrementing

### Manual Release (`release.yml`)

**Triggers:**
- Manual workflow dispatch only

**What it does:**
- Allows manual releases with custom version bump (major/minor/patch)
- Useful for:
  - Major version releases
  - Emergency hotfixes
  - Testing release process

**Note:** In most cases, you should use the automatic releases via `ci.yml` by merging to main.

## Development Workflow

### Normal Development Flow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/my-extension
   ```

2. **Make changes to extensions**
   - Modify existing extensions or create new ones
   - Extension versions are auto-bumped if you modify files
   - To manually control version: edit `extension.json` before committing

3. **Run tests locally**
   ```bash
   npm test
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/my-extension
   ```

5. **Create Pull Request**
   - CI runs all tests automatically
   - Validates extensions
   - Ensures no breaking changes

6. **Merge to main**
   - Once PR is approved and tests pass, merge to main
   - CI automatically:
     - Runs all tests again
     - Auto-bumps extension versions
     - Builds and signs extensions
     - Creates a new release
     - Publishes to GitHub Releases

### Version Bumping

**Automatic (Recommended):**
- When you modify an extension, the version is auto-bumped (patch)
- Script compares current version with last commit
- Only bumps if version wasn't manually changed

**Manual (For major/minor changes):**
- Edit `extension.json` and change version before committing
- Auto-bump script will detect this and skip auto-bumping
- Useful for breaking changes (major) or new features (minor)

### Testing

Run all tests locally before pushing:
```bash
# Run everything
npm test

# Or run individually
npm run test:scripts      # Test build scripts
npm run validate          # Validate metadata
npm run test:extensions   # Run extension unit tests
```

### Build Locally

To test the build process locally:
```bash
npm run build
```

This will:
- Auto-bump versions for changed extensions
- Validate all extensions
- Create zip files
- Generate manifest
- Sign with fallback signature (or Ed25519 if you have the key)

## Secrets

The following secrets are required for full functionality:

- `MANIFEST_PRIVATE_KEY` - Ed25519 private key for signing manifests
  - Set in repository settings → Secrets and variables → Actions
  - If not set, fallback SHA-256 signature is used

## Troubleshooting

### Tests fail on CI but pass locally
- Ensure you've committed all files
- Check that git history is available (`fetch-depth: 0`)
- Verify Node.js version matches (18.x)

### Release fails
- Check that `MANIFEST_PRIVATE_KEY` secret is set
- Verify manifest-version.json exists and is valid JSON
- Ensure dist/ directory is generated correctly

### Version not incrementing
- Check if version was manually changed in extension.json
- Verify git history is available for comparison
- Review bump-changed-extensions.js logs in CI

## Best Practices

1. **Always run tests locally** before pushing
2. **Use descriptive commit messages** - they appear in release notes
3. **Review CI logs** if builds fail
4. **Let auto-bump handle patch versions** - only manually bump for major/minor
5. **Create PRs for all changes** - don't push directly to main
6. **Tag releases manually only when needed** - automatic releases handle most cases
