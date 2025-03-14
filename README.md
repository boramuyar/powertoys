# PowerToys

A collection of utility packages for web development.

## Packages

| Package                                          | Description                                 | Version                                                                                                                         |
| ------------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [@powertoys/relay](./packages/relay)             | Tab 2 tab communication on web applications | [![npm version](https://img.shields.io/npm/v/@powertoys/relay.svg)](https://www.npmjs.com/package/@powertoys/relay)             |
| [@powertoys/relay-react](./packages/relay-react) | React bindings for @powertoys/relay         | [![npm version](https://img.shields.io/npm/v/@powertoys/relay-react.svg)](https://www.npmjs.com/package/@powertoys/relay-react) |

## Development

This is a monorepo managed with [pnpm](https://pnpm.io/).

### Setup

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install dependencies
pnpm install
```

### Building Packages

```bash
# Build all packages
pnpm build

# Build a specific package
pnpm --filter @powertoys/relay build
```

### Testing

```bash
# Run tests for all packages
pnpm test

# Run tests for a specific package
pnpm --filter @powertoys/relay test
```

## Creating New Packages

We welcome contributions for new framework integrations! You can create a new package in two ways:

### Using GitHub Actions

1. Go to the "Actions" tab in the GitHub repository
2. Select the "Create New Package" workflow
3. Click "Run workflow"
4. Fill in the required information
5. A pull request will be created automatically

### Manually

1. Create a new directory in the `packages` folder
2. Set up the package structure
3. Use the shared configuration:
   ```bash
   node packages/shared-config/setup-package.js your-package-name
   ```

See [PUBLISHING.md](./PUBLISHING.md) for more details on creating and publishing packages.

## Publishing

This repository uses GitHub Actions to automate the publishing process. See [PUBLISHING.md](./PUBLISHING.md) for detailed instructions.

## License

MIT
