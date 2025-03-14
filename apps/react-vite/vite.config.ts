import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync, mkdirSync } from "fs";

const copyWorkerPlugin = () => {
  return {
    name: "copy-worker-plugin",
    buildStart() {
      try {
        mkdirSync("public/workers", { recursive: true });
        const workerSrc = resolve("node_modules", "@powertoys/relay/dist/relay.worker.js");
        const workerDest = resolve("public/workers/relay.worker.js");
        copyFileSync(workerSrc, workerDest);
        console.log("✅ SharedWorker file copied to public/workers/relay.worker.js");
      } catch (error) {
        console.error("❌ Failed to copy SharedWorker file:", error);
      }
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyWorkerPlugin()],
  define: {
    "process.env.RELAY_WORKER_URL": JSON.stringify("/workers/relay.worker.js"),
  },
});
