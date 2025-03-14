export { Relay, type RelayOptions } from "./core/relay";
export { Observable, type Subscriber } from "./core/observer";

export type { TabInfo, TabListItem, ActionHandler, ActionHandlerMap, TabCommunicatorEvent } from "./types";

export { default as vitePlugin } from "./plugins/vite";
export { default as webpackPlugin } from "./plugins/webpack";
export { default as rollupPlugin } from "./plugins/rollup";
export { default as esbuildPlugin } from "./plugins/esbuild";
