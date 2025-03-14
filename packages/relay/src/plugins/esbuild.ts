import type { Plugin } from "esbuild";
import { mergeOptions, copyWorkerFile, getWorkerUrl, RelayPluginOptions } from "./utils";

/**
 * Creates an esbuild plugin that copies the Relay SharedWorker file to the public directory
 * and defines the necessary environment variable.
 */
export default function esbuildPlugin(userOptions: RelayPluginOptions = {}): Plugin {
  const options = mergeOptions(userOptions);
  const workerUrl = getWorkerUrl(options);

  return {
    name: "relay-esbuild-plugin",

    setup(build) {
      // Copy the worker file when the build starts
      build.onStart(() => {
        copyWorkerFile(options);
      });

      // Define the environment variable for the worker URL
      build.onResolve({ filter: new RegExp(`process\\.env\\.${options.envVarName}`) }, args => {
        return {
          path: args.path,
          namespace: "env-ns",
        };
      });

      build.onLoad({ filter: /.*/, namespace: "env-ns" }, () => {
        return {
          contents: JSON.stringify(workerUrl),
          loader: "json",
        };
      });
    },
  };
}
