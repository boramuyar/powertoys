import type { Plugin } from "rollup";
import { mergeOptions, copyWorkerFile, getWorkerUrl, RelayPluginOptions } from "./utils";

/**
 * Creates a Rollup plugin that copies the Relay SharedWorker file to the public directory
 * and defines the necessary environment variable.
 */
export default function rollupPlugin(userOptions: RelayPluginOptions = {}): Plugin {
  const options = mergeOptions(userOptions);
  const workerUrl = getWorkerUrl(options);

  return {
    name: "relay-rollup-plugin",

    // Copy the worker file when the build starts
    buildStart() {
      copyWorkerFile(options);
    },

    // Replace process.env references with the worker URL
    transform(code: string) {
      const regex = new RegExp(`process\\.env\\.${options.envVarName}`, "g");
      const replacedCode = code.replace(regex, JSON.stringify(workerUrl));

      if (code !== replacedCode) {
        return {
          code: replacedCode,
          map: null,
        };
      }

      return null;
    },
  };
}
