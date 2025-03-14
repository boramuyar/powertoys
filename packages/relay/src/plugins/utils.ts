import path from "path";
import fs from "fs";

/**
 * Common configuration options for all plugins
 */
export interface RelayPluginOptions {
  /** Source path of the worker file */
  workerSrcPath?: string;
  /** Destination path where the worker should be copied */
  workerDestPath?: string;
  /** Filename of the worker */
  workerFilename?: string;
  /** Name of the environment variable to define */
  envVarName?: string;
  /** Public path where the worker will be served from */
  publicPath?: string;
  /** Whether to log verbose output */
  verbose?: boolean;
}

/**
 * Default configuration for the Relay plugin
 */
export const defaultOptions: RelayPluginOptions = {
  workerSrcPath: "node_modules/@powertoys/relay/dist/relay.worker.js",
  workerDestPath: "public/workers",
  workerFilename: "relay.worker.js",
  envVarName: "RELAY_WORKER_URL",
  publicPath: "/workers",
  verbose: true,
};

/**
 * Merge user options with default options
 */
export function mergeOptions(userOptions: RelayPluginOptions = {}): RelayPluginOptions {
  return { ...defaultOptions, ...userOptions };
}

/**
 * Copy the worker file from source to destination
 */
export function copyWorkerFile(options: RelayPluginOptions): boolean {
  try {
    const resolvedSrcPath = path.resolve(options.workerSrcPath!);
    const resolvedDestDir = path.resolve(options.workerDestPath!);
    const resolvedDestPath = path.join(resolvedDestDir, options.workerFilename!);

    // Create destination directory if it doesn't exist
    if (!fs.existsSync(resolvedDestDir)) {
      fs.mkdirSync(resolvedDestDir, { recursive: true });
    }
    // Copy the file
    fs.copyFileSync(resolvedSrcPath, resolvedDestPath);

    if (options.verbose) {
      console.log(`✅ SharedWorker file copied to ${resolvedDestPath}`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Failed to copy SharedWorker file:`, error);
    return false;
  }
}

/**
 * Get the final URL for the worker
 */
export function getWorkerUrl(options: RelayPluginOptions): string {
  return `${options.publicPath}/${options.workerFilename}`;
}
