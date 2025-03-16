import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import packageJson from "./package.json" assert { type: "json" };
import { readFileSync } from "fs";
import path from "path";

const commonExternal = ["react", "react-dom"];

// Custom plugin to inject worker code during the main build
function injectWorkerCode() {
  return {
    name: "inject-worker-code",
    transform(code, id) {
      // Only process the worker.util.ts file
      if (!id.includes("worker.util.ts")) return null;

      try {
        // Read the built worker file
        const workerCode = readFileSync(path.resolve("dist/relay.worker.js"), "utf8");

        // Replace the placeholder with the stringified worker code
        return code.replace(
          'export const WORKER_CODE = "__WORKER_CODE_PLACEHOLDER__";',
          `export const WORKER_CODE = ${JSON.stringify(workerCode)};`
        );
      } catch (error) {
        this.error(`Failed to inject worker code: ${error.message}`);
        return null;
      }
    },
  };
}

export default [
  // Worker build
  {
    input: "src/worker/relay.worker.ts",
    output: {
      file: "dist/relay.worker.js",
      format: "iife",
      sourcemap: true,
      name: "relayWorker",
    },
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.worker.json",
      }),
      terser(),
    ],
    external: commonExternal,
  },
  // Main library build
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve({ browser: true }),
      commonjs(),
      injectWorkerCode(),
      typescript({
        tsconfig: "./tsconfig.json",
      }),
      terser(),
    ],
    external: commonExternal,
  },
  // TypeScript declarations
  {
    input: "dist/types/index.d.ts",
    output: [{ file: packageJson.types, format: "esm" }],
    plugins: [dts()],
  },
];
