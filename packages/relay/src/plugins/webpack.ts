import type { Compiler } from "webpack";
import { mergeOptions, copyWorkerFile, getWorkerUrl, RelayPluginOptions } from "./utils";

/**
 * Creates a Webpack plugin that copies the Relay SharedWorker file to the public directory
 * and defines the necessary environment variable.
 */
export default function webpackPlugin(userOptions: RelayPluginOptions = {}) {
  const options = mergeOptions(userOptions);
  const workerUrl = getWorkerUrl(options);

  return {
    apply(compiler: Compiler) {
      // Copy the worker file before compilation starts
      compiler.hooks.beforeCompile.tap("RelayWebpackPlugin", () => {
        copyWorkerFile(options);
      });

      // Define the environment variable for the worker URL
      new (require("webpack").DefinePlugin)({
        [`process.env.${options.envVarName}`]: JSON.stringify(workerUrl),
      }).apply(compiler);
    },
  };
}
