# Publishing Packages to npm

This repository uses GitHub Actions to automate the publishing of packages to npm. Here's how to use it:

## Prerequisites

1. You need to have an npm account.
2. You need to be added as a collaborator to the `@powertoys` organization on npm.
3. You need to generate an npm access token with publish permissions.
4. The npm token needs to be added as a repository secret in GitHub named `NPM_TOKEN`.

## Publishing Workflow

### Automatic Publishing (Recommended)

The easiest way to publish packages is to use the GitHub Actions workflow:

1. Go to the "Actions" tab in your GitHub repository.
2. Select the "Publish Packages" workflow.
3. Click "Run workflow".
4. Choose the version bump type (patch, minor, major, etc.).
5. Click "Run workflow" to start the process.

This will:

- Build all packages
- Run tests
- Bump versions according to your selection
- Publish packages to npm
- Create a commit with the version changes

### Manual Publishing

If you prefer to publish manually:

1. Clone the repository.
2. Install dependencies: `pnpm install`
3. Build packages: `pnpm build`
4. Run tests: `pnpm test`
5. Version packages: `pnpm -r exec npm version [patch|minor|major]`
6. Publish packages: `pnpm -r publish --access public`

## Creating New Packages

### Using GitHub Actions

1. Go to the "Actions" tab in your GitHub repository.
2. Select the "Create New Package" workflow.
3. Click "Run workflow".
4. Fill in the required information:
   - Package name (e.g., `relay-vue`)
   - Package description
   - Framework the package is for
5. Click "Run workflow" to start the process.

This will create a new package with the basic structure and open a pull request.

### Manually

1. Create a new directory in the `packages` folder.
2. Create the necessary files (package.json, src/index.ts, etc.).
3. If you have the shared-config package set up, run:
   ```
   node packages/shared-config/setup-package.js your-package-name
   ```
4. Install dependencies and build the package.

## Package Naming Convention

All packages should follow the naming convention:

- Core package: `@powertoys/relay`
- Framework-specific packages: `@powertoys/relay-[framework]` (e.g., `@powertoys/relay-react`, `@powertoys/relay-vue`)

## Version Management

We follow semantic versioning (SemVer):

- **Patch** (`1.0.0` → `1.0.1`): Bug fixes and minor changes
- **Minor** (`1.0.0` → `1.1.0`): New features, backward compatible
- **Major** (`1.0.0` → `2.0.0`): Breaking changes

## Publishing Checklist

Before publishing, ensure:

1. All tests pass
2. Documentation is updated
3. CHANGELOG.md is updated (if applicable)
4. README.md is up to date
5. All dependencies are correctly specified
