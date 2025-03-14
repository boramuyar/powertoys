import type { Plugin } from "vite";
import { mergeOptions, copyWorkerFile, getWorkerUrl, RelayPluginOptions } from "./utils";

/**
 * Creates a Vite plugin that copies the Relay SharedWorker file to the public directory
 * and defines the necessary environment variable.
 */
export default function vitePlugin(userOptions: RelayPluginOptions = {}): Plugin {
  const options = mergeOptions(userOptions);

  return {
    name: "vite-plugin-relay-worker",

    // Copy the worker file when the build starts
    buildStart() {
      copyWorkerFile(options);
    },

    // Define the environment variable for the worker URL
    config(config) {
      const workerUrl = getWorkerUrl(options);

      return {
        define: {
          [`process.env.${options.envVarName}`]: JSON.stringify(workerUrl),
        },
        ...config,
      };
    },
  };
}
