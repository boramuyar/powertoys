import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import packageJson from "./package.json" assert { type: "json" };

const commonExternal = ["react", "react-dom"];

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
